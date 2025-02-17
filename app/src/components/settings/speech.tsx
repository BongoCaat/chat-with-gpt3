import SettingsTab from "./tab";
import SettingsOption from "./option";
import { Button, Select, TextInput } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectElevenLabsApiKey, setElevenLabsApiKey } from "../../store/api-keys";
import { useCallback, useEffect, useMemo, useState } from "react";
import { selectVoice, setVoice } from "../../store/voices";
import { getVoices } from "../../tts/elevenlabs";
import { selectSettingsOption } from "../../store/settings-ui";
import { defaultVoiceList } from "../../tts/defaults";
import { FormattedMessage, useIntl } from "react-intl";

export default function SpeechOptionsTab() {
    const intl = useIntl();

    const option = useAppSelector(selectSettingsOption);
    const elevenLabsApiKey = useAppSelector(selectElevenLabsApiKey);
    const voice = useAppSelector(selectVoice);

    const dispatch = useAppDispatch();
    const onElevenLabsApiKeyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => dispatch(setElevenLabsApiKey(event.target.value)), [dispatch]);
    const onVoiceChange = useCallback((value: string) => dispatch(setVoice(value)), [dispatch]);

    const [voices, setVoices] = useState<any[]>(defaultVoiceList);
    useEffect(() => {
        if (elevenLabsApiKey) {
            getVoices().then(data => {
                if (data?.voices?.length) {
                    setVoices(data.voices);
                }
            });
        }
    }, [elevenLabsApiKey]);

    const apiKeyOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: 'Su clave API de texto a voz de ElevenLabs (Opcional)', description: "Rumbo a la configuración de la clave API de ElevenLabs en la pantalla de configuración" })}
                        focused={option === 'elevenlabs-api-key'}>
            <TextInput placeholder={intl.formatMessage({ defaultMessage: "Pegue su clave API aquí" })}
                value={elevenLabsApiKey || ''} onChange={onElevenLabsApiKeyChange} />
            <p>
                <FormattedMessage defaultMessage="Dale a ChatGPT una voz humana realista conectando tu cuenta de ElevenLabs (observa una vista previa de las voces disponibles a continuación). <a>Haga clic aquí para registrarte.</a>"
                    values={{
                        a: (chunks: any) => <a href="https://beta.elevenlabs.io" target="_blank" rel="noreferrer">{chunks}</a>
                    }} />
            </p>
            <p>
                <FormattedMessage defaultMessage="Puede encontrar su clave API haciendo clic en su avatar o sus iniciales en la parte superior derecha del sitio web de ElevenLabs y luego haciendo clic en Perfil. Su clave API se almacena solo en este dispositivo y nunca se transmite a nadie excepto a ElevenLabs." />
            </p>
        </SettingsOption>
    ), [option, elevenLabsApiKey, onElevenLabsApiKeyChange]);

    const voiceOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: 'Voz', description: 'Dirigirse a la configuración que permite a los usuarios elegir una voz de texto a voz de ElevenLabs, en la pantalla de configuración' })}
                        focused={option === 'elevenlabs-voice'}>
            <Select
                value={voice}
                onChange={onVoiceChange}
                data={[
                    ...voices.map(v => ({ label: v.name, value: v.voice_id })),
                ]} />
            <audio controls style={{ display: 'none' }} id="voice-preview" key={voice}>
                <source src={voices.find(v => v.voice_id === voice)?.preview_url} type="audio/mpeg" />
            </audio>
            <Button onClick={() => (document.getElementById('voice-preview') as HTMLMediaElement)?.play()} variant='light' compact style={{ marginTop: '1rem' }}>
                <i className='fa fa-headphones' />
                <span>
                    <FormattedMessage defaultMessage="Vista previa de voz" description="Etiqueta para el botón que reproduce una vista previa de la voz de texto a voz de ElevenLabs seleccionada" />
                </span>
            </Button>
        </SettingsOption>
    ), [option, voice, voices, onVoiceChange]);

    const elem = useMemo(() => (
        <SettingsTab name="speech">
            {apiKeyOption}
            {voices.length > 0 && voiceOption}
        </SettingsTab>
    ), [apiKeyOption, voiceOption, voices.length]);

    return elem;
}