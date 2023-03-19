import SettingsTab from "./tab";
import SettingsOption from "./option";
import { Checkbox, TextInput } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectOpenAIApiKey, setOpenAIApiKeyFromEvent, selectUseOpenAIWhisper, setUseOpenAIWhisperFromEvent } from "../../store/api-keys";
import { selectSettingsOption } from "../../store/settings-ui";
import { FormattedMessage, useIntl } from "react-intl";

export default function UserOptionsTab(props: any) {
    const option = useAppSelector(selectSettingsOption);
    const openaiApiKey = useAppSelector(selectOpenAIApiKey);
    const useOpenAIWhisper = useAppSelector(selectUseOpenAIWhisper);
    const intl = useIntl()

    const dispatch = useAppDispatch();
    const onOpenAIApiKeyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => dispatch(setOpenAIApiKeyFromEvent(event)), [dispatch]);
    const onUseOpenAIWhisperChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => dispatch(setUseOpenAIWhisperFromEvent(event)), [dispatch]);

    const elem = useMemo(() => (
        <SettingsTab name="user">
            <SettingsOption heading={intl.formatMessage({ defaultMessage: "Su clave API de OpenAI", description: "Rumbo a la configuración de la clave API de OpenAI en la pantalla de configuración" })}
                focused={option === 'openai-api-key'}>
                <TextInput
                    placeholder={intl.formatMessage({ defaultMessage: "Pegue su clave API aquí" })}
                    value={openaiApiKey || ''}
                    onChange={onOpenAIApiKeyChange} />
                <p>
                    <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer">
                        <FormattedMessage defaultMessage="Encuentre su clave API aquí." description="Etiqueta para el enlace que lleva al usuario a la página del sitio web de OpenAI donde puede encontrar su clave API." />
                    </a>
                </p>

                <Checkbox
                    style={{ marginTop: '1rem' }}
                    id="use-openai-whisper-api" checked={useOpenAIWhisper!} onChange={onUseOpenAIWhisperChange}
                    label="Utilice la API Whisper de OpenAI para el reconocimiento de voz."
                />
                
                <p>
                    <FormattedMessage defaultMessage="Su clave API se almacena solo en este dispositivo y nunca se transmite a nadie excepto a OpenAI." />
                </p>
                <p>
                    <FormattedMessage defaultMessage="El uso de la clave API de OpenAI se factura a una tarifa de pago por uso, aparte de su suscripción a ChatGPT." />
                </p>
            </SettingsOption>
        </SettingsTab>
    ), [option, openaiApiKey, useOpenAIWhisper, onOpenAIApiKeyChange]);

    return elem;
}