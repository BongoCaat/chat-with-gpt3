import SettingsTab from "./tab";
import SettingsOption from "./option";
import { Button, Select, Slider, Textarea } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { defaultSystemPrompt, defaultModel } from "../../openai";
import { useAppDispatch, useAppSelector } from "../../store";
import { resetModel, setModel, selectModel, resetSystemPrompt, selectSystemPrompt, selectTemperature, setSystemPrompt, setTemperature } from "../../store/parameters";
import { selectSettingsOption } from "../../store/settings-ui";
import { FormattedMessage, useIntl } from "react-intl";

export default function GenerationOptionsTab(props: any) {
    const intl = useIntl();
    
    const option = useAppSelector(selectSettingsOption);
    const initialSystemPrompt = useAppSelector(selectSystemPrompt);
    const model = useAppSelector(selectModel);
    const temperature = useAppSelector(selectTemperature);

    const dispatch = useAppDispatch();
    const onSystemPromptChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => dispatch(setSystemPrompt(event.target.value)), [dispatch]);
    const onModelChange = useCallback((value: string) => dispatch(setModel(value)), [dispatch]);
    const onResetSystemPrompt = useCallback(() => dispatch(resetSystemPrompt()), [dispatch]);
    const onResetModel = useCallback(() => dispatch(resetModel()), [dispatch]);
    const onTemperatureChange = useCallback((value: number) => dispatch(setTemperature(value)), [dispatch]);

    const resettableSystemPromopt = initialSystemPrompt
        && (initialSystemPrompt?.trim() !== defaultSystemPrompt.trim());

    const resettableModel = model
        && (model?.trim() !== defaultModel.trim());

    const systemPromptOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "Indicador del sistema", description: "Dirigirse a la configuración que permite a los usuarios personalizar el indicador del sistema, en la pantalla de configuración" })}
                        focused={option === 'system-prompt'}>
            <Textarea
                value={initialSystemPrompt || defaultSystemPrompt}
                onChange={onSystemPromptChange}
                minRows={5}
                maxRows={10}
                autosize />
            <p style={{ marginBottom: '0.7rem' }}>
                <FormattedMessage defaultMessage="El indicador del sistema se muestra a ChatGPT por el &quot;Sistema&quot; antes de su primer mensaje. La <code>'{{ datetime }}'</code> se reemplaza automáticamente por la fecha y hora actual."
                    values={{ code: chunk => <code style={{ whiteSpace: 'nowrap' }}>{chunk}</code> }} />
            </p>
            {resettableSystemPromopt && <Button size="xs" compact variant="light" onClick={onResetSystemPrompt}>
                <FormattedMessage defaultMessage="Restablecer a lo predeterminado" />
            </Button>}
        </SettingsOption>
    ), [option, initialSystemPrompt, resettableSystemPromopt, onSystemPromptChange, onResetSystemPrompt]);

    const modelOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "Modelo", description: "Dirigirse a la configuración que permite a los usuarios elegir un modelo con el que interactuar, en la pantalla de configuración" })}
                        focused={option === 'model'}>
            <Select
                value={model || defaultModel}
                data={[
                    { label: "GPT 3.5 Turbo (Predeterminado)", value: "gpt-3.5-turbo" },
                    { label: "GPT 4 (Requiere Invitación)", value: "gpt-4" },
                ]}
                onChange={onModelChange} />
            {model === 'gpt-4' && (
                <p style={{ marginBottom: '0.7rem' }}>
                    <FormattedMessage defaultMessage="Nota: GPT-4 solo funcionará si a su cuenta de OpenAI se le ha otorgado acceso al nuevo modelo. <a>Solicita acceso aquí.</a>"
                        values={{ a: chunk => <a href="https://openai.com/waitlist/gpt-4-api" target="_blank" rel="noreferer">{chunk}</a> }} />
                </p>
            )}
            {resettableModel && <Button size="xs" compact variant="light" onClick={onResetModel}>
                <FormattedMessage defaultMessage="Restablecer a lo predeterminado" />
            </Button>}
        </SettingsOption>
    ), [option, model, resettableModel, onModelChange, onResetModel]);

    const temperatureOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({
            defaultMessage: "Temperatura: {temperature, number, ::.0}", 
            description: "Etiqueta para el botón que abre un modal para configurar la 'temperatura' (aleatoriedad) de las respuestas de IA",
        }, { temperature })}
                        focused={option === 'temperature'}>
            <Slider value={temperature} onChange={onTemperatureChange} step={0.1} min={0} max={1} precision={3} />
            <p>
                <FormattedMessage defaultMessage="El parámetro de temperatura controla la aleatoriedad de las respuestas de la IA. Los valores más bajos harán que la IA sea más predecible, mientras que los valores más altos la harán más creativa." />
            </p>
        </SettingsOption>
    ), [temperature, option, onTemperatureChange]);

    const elem = useMemo(() => (
        <SettingsTab name="options">
            {systemPromptOption}
            {modelOption}
            {temperatureOption}
        </SettingsTab>
    ), [systemPromptOption, modelOption, temperatureOption]);

    return elem;
}