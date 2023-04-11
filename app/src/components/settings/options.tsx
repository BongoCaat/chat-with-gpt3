import SettingsTab from "./tab";
import SettingsOption from "./option";
import { Modal, Button, Select, Slider, Textarea } from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultSystemPrompt, defaultModel } from "../../openai";
import { useAppDispatch, useAppSelector } from "../../store";
import { resetModel, setModel, selectModel, resetSystemPrompt, selectSystemPrompt, selectTemperature, setSystemPrompt, setTemperature } from "../../store/parameters";
import { selectSettingsOption } from "../../store/settings-ui";
import { FormattedMessage, useIntl } from "react-intl";
import { useMediaQuery } from 'react-responsive';
import useIndicatorOptions from "../../store/IndicatorOptions";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (index: number) => void;
    index: number;
    title: string;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, index, title }: ConfirmationModalProps) => {
    return (
      <Modal
        opened={isOpen}
        onClose={onClose}
        title={`Confirmar eliminación de indicador`}
        size="sm"
        style={{ borderRadius: "8px" }}
      >
        <div style={{ display: "flex", marginBottom: "1.3rem" }}>
            <p style={{ marginBottom: '15px', marginRight: '20px' }}>¿Estás seguro de que deseas eliminar el indicador  "{title}"  ?</p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="light" onClick={onClose} style={{ marginRight: "1.1rem" }}>
            Cancelar
          </Button>
          <Button variant="filled" color="red" onClick={() => onConfirm(index)}>
            Eliminar
          </Button>
        </div>
      </Modal>
    );
};

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
        const storedIndicators = localStorage.getItem("indicators");
        if (storedIndicators) {
            return JSON.parse(storedIndicators);
        } else {
            return [{ title: "Indicador predeterminado", value: defaultSystemPrompt }];
        }
    });
    const [newIndicatorTitle, setNewIndicatorTitle] = useState("");
    const [newIndicatorValue, setNewIndicatorValue] = useState("");
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [indicatorToDelete, setIndicatorToDelete] = useState(-1);
    const [confirmationModalTitle, setConfirmationModalTitle] = useState("");
    const [showError, setShowError] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState(initialSystemPrompt || defaultSystemPrompt);
    const indicatorOptions = useIndicatorOptions();

    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

    useEffect(() => {
        localStorage.setItem("indicators", JSON.stringify(indicators));
    }, [indicators]);

    useEffect(() => {
        setSelectedIndicator(initialSystemPrompt || defaultSystemPrompt);
    }, [initialSystemPrompt]);

    const addIndicator = () => {
        if (newIndicatorTitle && newIndicatorValue) {
            setIndicators([...indicators, { title: newIndicatorTitle, value: newIndicatorValue }]);
            setNewIndicatorTitle("");
            setNewIndicatorValue("");
            setShowError(false);
        } else {
            setShowError(true);
        }
    };

    const openConfirmationModal = (index: number) => {
        setIndicatorToDelete(index);
        setIsConfirmationModalOpen(true);
        const title = indicators[index].title;
        setConfirmationModalTitle(title);
    };

    const closeConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
    };

    const handleUseIndicator = (index: number) => {
        const indicator = indicators[index];
        dispatch(setSystemPrompt(indicator.value));
        setSelectedIndicator(indicator.value);
    };

    const removeIndicator = (index: number) => {
        if (index !== 0) {
            const newIndicators = [...indicators];
            newIndicators.splice(index, 1);
            setIndicators(newIndicators);
            setIsConfirmationModalOpen(false);
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

    const onIndicatorChange = useCallback((value) => {
        setSelectedIndicator(value);
        dispatch(setSystemPrompt(value));
    }, [dispatch]);

    const systemPromptOption = useMemo(() => (
        <SettingsOption heading={intl.formatMessage({ defaultMessage: "Indicador del sistema", description: "Dirigirse a la configuración que permite a los usuarios personalizar el indicador del sistema, en la pantalla de configuración" })}
                        focused={option === 'system-prompt'}>
            <div>
                <Textarea
                    value={initialSystemPrompt || defaultSystemPrompt}
                    onChange={onSystemPromptChange}
                    minRows={5}
                    maxRows={10}
                    autosize
                />
                <Select
                    placeholder="Seleccionar indicador"
                    value={selectedIndicator}
                    style={{ marginTop: '0.25rem', marginBottom: '0.45rem' }}
                    onChange={(value) => {
                        if (typeof value === 'string') {
                            onIndicatorChange(value);
                            setSelectedIndicator(value);
                        }
                    }}
                    data={indicatorOptions}
                    searchable
                />
                <p style={{ marginBottom: '0.7rem' }}>
                    <FormattedMessage defaultMessage="El indicador del sistema se muestra a ChatGPT por el &quot;Sistema&quot; antes de su primer mensaje. La <code>'{{ datetime }}'</code> se reemplaza automáticamente por la fecha y hora actual."
                        values={{ code: chunk => <code style={{ whiteSpace: 'nowrap' }}>{chunk}</code> }} />
                </p>
                {resettableSystemPrompt && <Button size="sm" compact variant="filled" style= {{ marginTop: '0.5rem', marginBottom: '0.5rem' }} onClick={onResetSystemPrompt}>
                    <FormattedMessage defaultMessage="Restablecer a lo predeterminado" />
                </Button>}
            </div>
            <div style={{ marginTop: "1rem" }}>
                <Button size="lg" style= {{ width: '100%' }} compact variant="outline" onClick={addIndicator}>
                    {isMobile ? (
                        <FormattedMessage defaultMessage="Agregar indicador: " />
                    ) : (
                        <FormattedMessage defaultMessage="Agregar nuevo indicador del sistema: " />
                    )}
                </Button>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem", marginTop: '1rem' }}>
                    <label>Título:</label>
                    <input type="text" style={{ marginBottom: '1rem', marginTop: '1rem' }} value={newIndicatorTitle} onChange={(event) => {
                        setNewIndicatorTitle(event.target.value);
                        setShowError(event.target.value === "" && newIndicatorValue === "");
                    }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem", marginTop: '1rem' }}>
                    <label>Valor:</label>
                    <Textarea
                        style= {{ marginBottom: '1rem', marginTop: '1rem' }}
                        value={newIndicatorValue}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setNewIndicatorValue(event.target.value);
                            setShowError(event.target.value === "" && newIndicatorTitle === "");
                        }}
                        minRows={1}
                        maxRows={5}
                        autosize />
                </div>
                {showError && <p style={{ color: "red" }}>El título y el valor son obligatorios</p>}
                {indicators.length > 1 && (
    <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <h4>Indicadores del sistema creados:</h4>
        {indicators.map((indicator, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginTop: "0.7rem", marginBottom: "0.5rem" }}>
                <div style={{ flexGrow: 0.045 }}>
                    <input type="text" value={indicator.title} onChange={(event) => editIndicatorTitle(index, event.target.value)} style={{ minHeight: "30px", maxHeight: "10px", width: "111px" }} />
                </div>
                <div style={{ flexGrow: 1, marginLeft: "0.5rem", marginTop: "0.3rem", marginBottom: "0.45rem" }}>
    <Textarea
        value={indicator.value}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => editIndicatorValue(index, event.target.value)}
        style={{ minHeight: "50px", maxHeight: "150px", width: "100%" }}
    />
</div>

<div style={{ display: "flex", flexDirection: "column" }}>
{index !== 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Button size="sm" compact variant="outline" style={{ marginBottom: "0.75", marginRight: "0.55rem", marginLeft: "0.55rem" }} onClick={() => openConfirmationModal(index)}>
                    <FormattedMessage defaultMessage="Borrar" />
                </Button>
                <ConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    onClose={closeConfirmationModal}
                    onConfirm={removeIndicator}
                    index={indicatorToDelete}
                    title={confirmationModalTitle}
                />
            </div>
        )}
  <Button size="sm" compact variant="outline" style={{ marginTop: "0.75rem", marginRight: "0.55rem", marginLeft: "0.55rem" }} onClick={() => handleUseIndicator(index)}>
    <FormattedMessage defaultMessage="Usar" />
  </Button>
</div>
            </div>
        ))}
    </div>
)}
            </div>
        </SettingsOption>
    ), [intl, option, initialSystemPrompt, indicatorOptions, onSystemPromptChange, confirmationModalTitle, selectedIndicator, onIndicatorChange, handleUseIndicator, indicatorToDelete, showError, isMobile, openConfirmationModal, isConfirmationModalOpen, newIndicatorTitle, newIndicatorValue, resettableSystemPrompt, resetSystemPrompt, setSystemPrompt, onResetSystemPrompt, indicators, newIndicatorTitle, newIndicatorValue, addIndicator, removeIndicator, editIndicatorTitle, editIndicatorValue]);

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
        <SettingsOption
          heading={intl.formatMessage({
            defaultMessage: "Temperatura: {temperature, number, ::.0}",
            description:
              "Etiqueta para el botón que abre un modal para configurar la 'temperatura' (aleatoriedad) de las respuestas de IA",
          }, { temperature })}
          focused={option === 'temperature'}
        >
          <Slider value={temperature} onChange={onTemperatureChange} step={0.1} min={0} max={1} precision={3} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", marginBottom: "2.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: temperature === 0 ? "bold" : "normal" }}>Preciso</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: temperature === 0.5 ? "bold" : "normal" }}>Neutro</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: temperature === 1 ? "bold" : "normal" }}>Creativo</p>
            </div>
          </div>
          <p>
            <FormattedMessage defaultMessage="El parámetro de temperatura controla la aleatoriedad de las respuestas de la IA. Los valores más altos, como 0.8, aumentarán la creatividad de la IA, mientras que los valores más bajos, como 0.2, aumentarán su precisión y determinismo." />
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
