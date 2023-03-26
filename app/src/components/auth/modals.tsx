import styled from "@emotion/styled";
import { Button, Modal, PasswordInput, TextInput } from "@mantine/core";
import { useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeModals, openLoginModal, openSignupModal, selectModal } from "../../store/ui";

const Container = styled.form`
    * {
        font-family: "Work Sans", sans-serif;
    }

    h2 {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .mantine-TextInput-root, .mantine-PasswordInput-root {
        margin-top: 1rem;
    }
    
    .mantine-TextInput-root + .mantine-Button-root,
    .mantine-PasswordInput-root + .mantine-Button-root {
        margin-top: 1.618rem;
    }

    .mantine-Button-root {
        margin-top: 1rem;
    }

    label {
        margin-bottom: 0.25rem;
    }
`;

export function LoginModal(props: any) {
    const modal = useAppSelector(selectModal);
    const dispatch = useAppDispatch();
    const intl = useIntl();

    const onClose = useCallback(() => dispatch(closeModals()), [dispatch]);
    const onCreateAccountClick = useCallback(() => dispatch(openSignupModal()), [dispatch]);

    return <Modal opened={modal === 'login'} onClose={onClose} withCloseButton={true}>
        <Container action="/chatapi/login" method="post">
            <h2>
                <FormattedMessage defaultMessage={"Iniciar sesión"} />
            </h2>
            <input type="hidden" name="redirect_url" value={window.location.href} />
            <TextInput
                label={intl.formatMessage({ defaultMessage: "Email address" })}
                name="username"
                placeholder={intl.formatMessage({ defaultMessage: "Ingrese su dirección de correo electrónico" })}
                type="email"
                required />
            <PasswordInput
                label={intl.formatMessage({ defaultMessage: "Password" })}
                name="password"
                placeholder={intl.formatMessage({ defaultMessage:"Ingresa tu contraseña" })}
                maxLength={500}
                required />
            <Button fullWidth type="submit">
                <FormattedMessage defaultMessage={"Iniciar sesión"} />
            </Button>
            <Button fullWidth variant="subtle" onClick={onCreateAccountClick}>
                <FormattedMessage defaultMessage={"O crea una cuenta"} description="Etiqueta para un botón en la página Iniciar sesión que permite al usuario crear una cuenta en su lugar" />
            </Button>
        </Container>
    </Modal>
}

export function CreateAccountModal(props: any) {
    const modal = useAppSelector(selectModal);
    const dispatch = useAppDispatch();
    const intl = useIntl();

    const onClose = useCallback(() => dispatch(closeModals()), [dispatch]);
    const onSignInClick = useCallback(() => dispatch(openLoginModal()), [dispatch]);

    return <Modal opened={modal === 'signup'} onClose={onClose} withCloseButton={true}>
        <Container action="/chatapi/register" method="post">
            <h2>
                <FormattedMessage defaultMessage={"Crea una cuenta"} />
            </h2>
            <input type="hidden" name="redirect_url" value={window.location.href} />
            <TextInput
                label={intl.formatMessage({ defaultMessage: "Email address" })}
                name="username"
                placeholder={intl.formatMessage({ defaultMessage:"Ingrese su dirección de correo electrónico" })}
                type="email"
                required />
            <PasswordInput
                label={intl.formatMessage({ defaultMessage: "Password" })}
                name="password"
                placeholder={intl.formatMessage({ defaultMessage:"Ingresa tu contraseña" })}
                minLength={6}
                maxLength={500}
                required />
            <Button fullWidth type="submit">
                <FormattedMessage defaultMessage={"Registrarse"} />
            </Button>
            <Button fullWidth variant="subtle" onClick={onSignInClick}>
            <FormattedMessage defaultMessage={"O inicie sesión en una cuenta existente"} description="Etiqueta para un botón en la página Crear cuenta que permite al usuario iniciar sesión en su cuenta existente en su lugar" />
            </Button>
        </Container>
    </Modal>
}