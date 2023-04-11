import SettingsTab from "./tab";
import SettingsOption from "./option";
import { Checkbox, TextInput, Button } from "@mantine/core";
import { useCallback, useMemo, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectOpenAIApiKey, setOpenAIApiKey, selectUseOpenAIWhisper, setUseOpenAIWhisperFromEvent } from "../../store/api-keys";
import { selectSettingsOption } from "../../store/settings-ui";
import { FormattedMessage, useIntl } from "react-intl";

export default function UserOptionsTab(props: any) {
    const option = useAppSelector(selectSettingsOption);
    const openaiApiKey = useAppSelector(selectOpenAIApiKey);
    const useOpenAIWhisper = useAppSelector(selectUseOpenAIWhisper);
    const intl = useIntl()

    const dispatch = useAppDispatch();
    const onOpenAIApiKeyChange = useCallback((value: string) => dispatch(setOpenAIApiKey(value)), [dispatch]);
    const onUseOpenAIWhisperChange = useCallback((event: ChangeEvent<HTMLInputElement>) => dispatch(setUseOpenAIWhisperFromEvent(event)), [dispatch]);

    const copyOpenAIApiKey = useCallback(() => {
        const apiKey = "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";
        navigator.clipboard.writeText(apiKey);
        onOpenAIApiKeyChange(apiKey);
    }, [onOpenAIApiKeyChange]);

    const elem = useMemo(() => (
        <SettingsTab name="user">
            <SettingsOption heading={intl.formatMessage({ defaultMessage: "Su clave API de OpenAI", description: "Rumbo a la configuración de la clave API de OpenAI en la pantalla de configuración" })}
                focused={option === 'openai-api-key'}>
                <TextInput
                    placeholder={intl.formatMessage({ defaultMessage: "Pegue su clave API aquí" })}
                    value={openaiApiKey || ''}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onOpenAIApiKeyChange(event.target.value)} />
                <p>
                    <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer">
                        <FormattedMessage defaultMessage="Encuentre su clave API aquí." description="Etiqueta para el enlace que lleva al usuario a la página del sitio web de OpenAI donde puede encontrar su clave API." />
                    </a>
                </p>
                
                <p>
                    <FormattedMessage defaultMessage="Su clave API se almacena solo en este dispositivo y nunca se transmite a nadie excepto a OpenAI." />
                </p>
                <p>
                    <FormattedMessage defaultMessage="El uso de la clave API de OpenAI se factura a una tarifa de pago por uso, aparte de su suscripción a ChatGPT." />
                </p>

                <Checkbox
                    style={{ marginTop: '2rem', marginBottom: '2rem' }}
                    id="use-openai-whisper-api" checked={useOpenAIWhisper!} onChange={onUseOpenAIWhisperChange}
                    label="Utilice la API Whisper de OpenAI para el reconocimiento de voz."
                />

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.75rem' }}>
                    <Button onClick={copyOpenAIApiKey}>
                        Copiar clave API de OpenAI
                    </Button>
                </div>
                <p style={{ marginTop: '0.55rem', marginBottom: '0.55rem' }}>
                    <FormattedMessage defaultMessage="↑↑↑ | Al hacer clic en este botón, se copiará automáticamente la clave API de OpenAI y se pegará en el campo de entrada de arriba." />
                </p>

            </SettingsOption>
        </SettingsTab>
    ), [intl, option, openaiApiKey, onOpenAIApiKeyChange, copyOpenAIApiKey, useOpenAIWhisper, onUseOpenAIWhisperChange]);

    return elem;
}
