import SettingsTab from "./tab";
import SettingsOption from "./option";
import { Button, Select, Slider, Textarea } from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
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
    const resettableSystemPrompt = initialSystemPrompt
        && (initialSystemPrompt?.trim() !== defaultSystemPrompt.trim());
    const resettableModel = model
        && (model?.trim() !== defaultModel.trim());

    const [indicators, setIndicators] = useState(() => {
        // Leer los indicadores guardados en el localStorage al cargar la página
        const storedIndicators = localStorage.getItem("indicators");
        if (storedIndicators) {
            return JSON.parse(storedIndicators);
        } else {
            return [{ title: "Indicador predeterminado", value: defaultSystemPrompt }];
        }
    });
    const [newIndicatorTitle, setNewIndicatorTitle] = useState("");
    const [newIndicatorValue, setNewIndicatorValue] = useState("");

    useEffect(() => {
        // Guardar los indicadores en el localStorage cada vez que se actualizan
        localStorage.setItem("indicators", JSON.stringify(indicators));
    }, [indicators]);

    const addIndicator = () => {
        setIndicators([...indicators, { title: newIndicatorTitle, value: newIndicatorValue }]);
        setNewIndicatorTitle("");
        setNewIndicatorValue("");
    };

    const handleUseIndicator = (index: number) => {
        const indicator = indicators[index];
        dispatch(setSystemPrompt(indicator.value));
    };

    const removeIndicator = (index: number) => {
        if (index !== 0) {
            setIndicators(indicators.filter((_, i) => i !== index));
        }
    };

    const editIndicatorTitle = (index: number, newTitle: string) => {
        if (index !== 0) {
            setIndicators(indicators.map((indicator, i) => i === index ? { ...indicator, title: newTitle } : indicator));
        }
    };

    const editIndicatorValue = (index: number, newValue: string) => {
        if (index !== 0) {
            setIndicators(indicators.map((indicator, i) => i === index ? { ...indicator, value: newValue } : indicator));
        }
    };

    const systemPromptOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "Indicador del sistema", description: "Dirigirse a la configuración que permite a los usuarios personalizar el indicador del sistema, en la pantalla de configuración" })}
                        focused={option === 'system-prompt'}>
            <div>
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
                {resettableSystemPrompt && <Button size="xs" compact variant="light" style= {{ marginTop: '0.5rem', marginBottom: '0.5rem' }} onClick={onResetSystemPrompt}>
                    <FormattedMessage defaultMessage="Restablecer a lo predeterminado" />
                </Button>}
            </div>
            <div style={{ marginTop: "1rem" }}>
                <Button size="lg" compact variant="outline" onClick={addIndicator}>
                    <FormattedMessage defaultMessage="Agregar nuevo indicador del sistema:" />
                </Button>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem", marginTop: '1rem' }}>
                    <label>Título:</label>
                    <input type="text" style={{ marginBottom: '1rem', marginTop: '1rem' }} value={newIndicatorTitle} onChange={(event) => setNewIndicatorTitle(event.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem", marginTop: '1rem' }}>
                    <label>Valor:</label>
                    <Textarea
                        style= {{ marginBottom: '1rem', marginTop: '1rem' }}
                        value={newIndicatorValue}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setNewIndicatorValue(event.target.value)}
                        minRows={1}
                        maxRows={5}
                        autosize />
                </div>
                {indicators.length > 1 && (
    <div style={{ marginTop: "1rem" }}>
        <h4>Indicadores existentes:</h4>
        {indicators.map((indicator, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <div style={{ flexGrow: 1 }}>
                    <input type="text" value={indicator.title} onChange={(event) => editIndicatorTitle(index, event.target.value)} style={{ fontSize: 11, marginRight: "1rem" }} />
                </div>
                <div style={{ flexGrow: 1, marginLeft: "1rem", marginRight: "1.5rem", marginTop: "0.4rem", marginBottom: "0.4rem" }}>
    <Textarea
        value={indicator.value}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => editIndicatorValue(index, event.target.value)}
        style={{ minHeight: "100px", maxHeight: "500px", width: "100%" }}
    />
</div>

                {index !== 0 && (
                    <Button size="xs" compact variant="outline" style={{ marginRight: "0.6rem" }} onClick={() => removeIndicator(index)}>
                        <FormattedMessage defaultMessage="Borrar" />
                    </Button>
                )}
                <Button size="xs" compact variant="outline" style= {{ marginRight: "0.6rem" }} onClick={() => handleUseIndicator(index)}>
                    <FormattedMessage defaultMessage="Usar" />
                </Button>
            </div>
        ))}
    </div>
)}
            </div>
        </SettingsOption>
    ), [intl, option, initialSystemPrompt, onSystemPromptChange, handleUseIndicator, resettableSystemPrompt, resetSystemPrompt, setSystemPrompt, onResetSystemPrompt, indicators, newIndicatorTitle, newIndicatorValue, addIndicator, removeIndicator, editIndicatorTitle, editIndicatorValue]);

    const modelOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "Modelo", description: "Dirigirse a la configuración que permite a los usuarios elegir un modelo con el que interactuar, en la pantalla de configuración" })}
                        focused={option === 'model'}>
            <Select
                value={model || defaultModel}
                data={[
                    { label: "GPT 3.5 Turbo (Predeterminado)", value: "gpt-3.5-turbo" },
                    { label: "GPT 4 (Requiere Invitación)", value: "gpt-4" },
                    { label: "GPT 4 32k (Requiere Invitación)", value: "gpt-4-32k" },
                ]}
                onChange={onModelChange} />
            {model === 'gpt-4' && (
                <p style={{ marginBottom: '0.7rem' }}>
                    <FormattedMessage defaultMessage="Nota: GPT-4 solo funcionará si a su cuenta de OpenAI se le ha otorgado acceso al nuevo modelo. <a>Solicita acceso aquí.</a>"
                        values={{ a: chunk => <a href="https://openai.com/waitlist/gpt-4-api" target="_blank" rel="noreferer">{chunk}</a> }} />
                </p>
            )}
            {model === 'gpt-4-32k' && (
                <p style={{ marginBottom: '0.7rem' }}>
                    <FormattedMessage defaultMessage="Nota: GPT-4-32k solo funcionará si a su cuenta de OpenAI se le ha otorgado acceso al nuevo modelo. <a>Solicita acceso aquí.</a>"
                        values={{ a: chunk => <a href="https://openai.com/waitlist/gpt-4-api" target="_blank" rel="noreferer">{chunk}</a> }} />
                </p>
            )}
            {resettableModel && <Button size="xs" compact variant="light" style= {{ marginTop: '0.5rem', marginBottom: '0.5rem' }} onClick={onResetModel}>
                <FormattedMessage defaultMessage="Restablecer a lo predeterminado" />
            </Button>}
        </SettingsOption>
    ), [option, model, resetModel, resettableModel, onModelChange, onResetModel]);

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
