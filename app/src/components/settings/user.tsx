import SettingsTab from "./tab";
import SettingsOption from "./option";
import { TextInput } from "@mantine/core";
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectOpenAIApiKey, setOpenAIApiKeyFromEvent } from "../../store/api-keys";
import { selectSettingsOption } from "../../store/settings-ui";
import { FormattedMessage, useIntl } from "react-intl";

export default function UserOptionsTab(props: any) {
    const option = useAppSelector(selectSettingsOption);
    const openaiApiKey = useAppSelector(selectOpenAIApiKey);
    const intl = useIntl()

    const dispatch = useAppDispatch();
    const onOpenAIApiKeyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => dispatch(setOpenAIApiKeyFromEvent(event)), [dispatch]);

    const elem = useMemo(() => (
        <SettingsTab name="user">
            <SettingsOption heading={intl.formatMessage({ defaultMessage: "Su clave API de OpenAI" })}
                            focused={option === 'openai-api-key'}>
                <TextInput
                    placeholder={intl.formatMessage({ defaultMessage: "Pegue su clave API aquí" })}
                    value={openaiApiKey || ''}
                    onChange={onOpenAIApiKeyChange} />
                <p>
                    <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer">
                        <FormattedMessage defaultMessage="Encuentre su clave API aquí." />
                    </a>
                </p>
                <p>
                    <FormattedMessage defaultMessage="Su clave API se almacena solo en este dispositivo y nunca se transmite a nadie excepto a OpenAI." />
                </p>
                <p>
                    <FormattedMessage defaultMessage="El uso de la clave API de OpenAI se factura a una tarifa de pago por uso, aparte de su suscripción a ChatGPT." />
                </p>
            </SettingsOption>
        </SettingsTab>
    ), [option, openaiApiKey, onOpenAIApiKeyChange]);

    return elem;
}