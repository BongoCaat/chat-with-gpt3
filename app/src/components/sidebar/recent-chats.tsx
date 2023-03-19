import styled from '@emotion/styled';
import { useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context';
import { useAppDispatch } from '../../store';
import { toggleSidebar } from '../../store/sidebar';
import { ActionIcon, Menu } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { backend } from '../../backend';

const Container = styled.div`
    margin: calc(1.618rem - 1rem);
    margin-top: -0.218rem;
`;

const Empty = styled.p`
    text-align: center;
    font-size: 0.8rem;
    padding: 2rem;
`;

const ChatList = styled.div``;

const ChatListItemLink = styled(Link)`
    display: block;
    position: relative;
    padding: 0.4rem 1rem;
    margin: 0.218rem 0;
    line-height: 1.7;
    text-decoration: none;
    border-radius: 0.25rem;

    &:hover, &:focus, &:active {
        background: rgba(0, 0, 0, 0.1);
    }

    &.selected {
        background: #2b3d54;
        pointer-events: none;
    }

    strong {
        display: block;
        font-weight: 400;
        font-size: 1rem;
        line-height: 1.6;
        padding-right: 1rem;
        color: white;
    }

    p {
        font-size: 0.8rem;
        font-weight: 200;
        opacity: 0.8;
    }

    .mantine-ActionIcon-root {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        margin-top: -14px;
    }
`;

function ChatListItem(props: { chat: any, onClick: any, selected: boolean }) {
    const c = props.chat;
    const context = useAppContext();
    const modals = useModals();
    const navigate = useNavigate();

    const handleDelete = useCallback(() => {
        modals.openConfirmModal({
            title: "Estas seguro de que quieres borrar este chat?",
            children: <p style={{ lineHeight: 1.7 }}> El chat "{c.title}" va a ser permanentemente borrado. Esto no se puede deshacer.</p>,
            labels: {
                confirm: "Borrar permanentemente",
                cancel: "Cancelar",
            },
            confirmProps: {
                color: 'red',
            },
            onConfirm: async () => {
                try {
                    await backend.current?.deleteChat(c.chatID);
                    context.chat.deleteChat(c.chatID);
                    navigate('/');
                } catch (e) {
                    console.error(e);
                    modals.openConfirmModal({
                        title: "Algo salió mal",
                        children: <p style={{ lineHeight: 1.7 }}>The chat "{c.title}" could not be deleted.</p>,
                        labels: {
                            confirm: "Intenta nuevamente",
                            cancel: "Cancelar",
                        },
                        onConfirm: handleDelete,
                    });
                }
            },
        });
    }, [c.chatID, c.title]);

    return (
        <ChatListItemLink 
            to={'/chat/' + c.chatID}
            onClick={props.onClick} 
            onTouchStart={props.onClick}   // Agregado onTouchStart para eventos táctiles
            data-chat-id={c.chatID} 
            className={props.selected ? 'selected' : ''}
        >
            <strong>{c.title || <FormattedMessage defaultMessage={"Untitled"} description="Título predeterminado para sesiones de chat sin título" />}</strong>
            {props.selected && (
                <Menu>
                    <Menu.Target>
                        <ActionIcon color="green">
                            <i className="fa fa-bars" style={{ fontSize: '90%' }} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={handleDelete} color="red" icon={<i className="fa fa-trash" />}>
                            <FormattedMessage defaultMessage={"Borrar este chat"} />
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            )}
        </ChatListItemLink>
    );
}

export default function RecentChats(props: any) {
    const context = useAppContext();
    const dispatch = useAppDispatch();

    const currentChatID = context.currentChat.chat?.id;
    const recentChats = context.chat.search.query('');

    const handleClick = useCallback(() => {
        if (window.matchMedia('(max-width: 40em)').matches) {
            dispatch(toggleSidebar());
        }
    }, [dispatch]);

    useEffect(() => {
        if (currentChatID) {
            const el = document.querySelector(`[data-chat-id="${currentChatID}"]`);
            if (el) {
                el.scrollIntoView();
            }
        }
    }, [currentChatID]);

    return (
        <Container>
            {recentChats.length > 0 && <ChatList>
                {recentChats.map(c => (
                    <ChatListItem key={c.chatID} chat={c} onClick={handleClick} selected={c.chatID === currentChatID} />
                ))}
            </ChatList>}
            {recentChats.length === 0 && <Empty>
                <FormattedMessage defaultMessage={"Aún no hay chats."} description="Mensaje que se muestra en la pantalla Historial de chat para nuevos usuarios que no han iniciado su primera sesión de chat" />
            </Empty>}
        </Container>
    );
}
