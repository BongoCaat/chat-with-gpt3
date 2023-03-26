import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context';
import { useAppDispatch } from '../../store';
import { toggleSidebar } from '../../store/sidebar';
import { ActionIcon, Button, Input, Menu } from '@mantine/core';
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

const ChatList = styled.div`
  max-height: 46rem;
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: gray lightgray;

  &::-webkit-scrollbar {
    width: 18px;
  }

  &::-webkit-scrollbar-track {
    background: lightgray;
  }

  &::-webkit-scrollbar-thumb {
    background-color: gray;
    border-radius: 20px;
    border: 3px solid lightgray;
  }
`;

const ChatListItemLink = styled(Link)`
  display: block;
  position: relative;
  padding: 0.4rem 1rem;
  margin: 0.218rem 0;
  line-height: 1.7;
  text-decoration: none;
  border-radius: 0.25rem;

  &:hover,
  &:focus,
  &:active {
    background: rgba(0, 0, 0, 0.1);
  }

  &.selected {
    background: #2b3d54;
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

function ChatListItem(props: { chat: any; onClick: any; selected: boolean; index: number; selectedIndex: number; onSelect: (chatID: string, index: number) => void;}) {
  const c = props.chat;
  const context = useAppContext();
  const modals = useModals();
  const navigate = useNavigate();
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(c.title || '');

  useEffect(() => {
    setNewTitle(c.title || '');
  }, [c.title]);
  
  useEffect(() => {
    if (!editingTitle && newTitle !== c.title) {
      setNewTitle(c.title || '');
    }
  }, [c.title, editingTitle, newTitle]);

  const onDelete = useCallback(() => {
    modals.openConfirmModal({
      title: 'Estas seguro de que quieres borrar este chat?',
      children: (
        <p style={{ lineHeight: 1.7 }}>
          {' '}
          El chat "{c.title}" va a ser permanentemente borrado. Esto no se puede
          deshacer.
        </p>
      ),
      labels: {
        confirm: 'Borrar permanentemente',
        cancel: 'Cancelar',
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
            title: 'Algo salió mal',
            children: (
              <p style={{ lineHeight: 1.7 }}>
                The chat "{c.title}" could not be deleted.
              </p>
            ),
            labels: {
              confirm: 'Intenta nuevamente',
              cancel: 'Cancelar',
            },
            onConfirm: onDelete,
          });
        }
      },
    });
  }, [c.chatID, c.title]);

  const onEditTitle = useCallback(() => {
    setEditingTitle(true);
  }, []);

  const onSaveTitle = useCallback(async () => {
    try {
      await backend.current?.updateChatTitle(c.chatID, newTitle);
      context.chat.updateChatTitle(c.chatID, newTitle);
      setEditingTitle(false);
      setNewTitle(newTitle); // Actualiza el estado "newTitle" con el nuevo título
    } catch (e) {
      console.error(e);
      modals.openConfirmModal({
        title: 'Algo salió mal',
        children: (
          <p style={{ lineHeight: 1.7 }}>
            The chat "{c.title}" title could not be updated.
          </p>
        ),
        labels: {
          confirm: 'Intenta nuevamente',
          cancel: 'Cancelar',
        },
        onConfirm: onSaveTitle,
      });
    }
  }, [c.chatID, c.title, newTitle]);  

  const onCancelEditTitle = useCallback(() => {
    setNewTitle(c.title || '');
    setEditingTitle(false);
  }, [c.title]);

  return (
    <ChatListItemLink
      to={'/chat/' + c.chatID}
      onClick={props.onClick}
      data-chat-id={c.chatID}
      className={props.selected ? 'selected' : ''}
    >
      <strong>
        {editingTitle ? (
          <Input
            placeholder="Nuevo título"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: '95%', fontSize: '80%', marginBottom: '0.7rem', marginTop: '0.5rem' }}
          />
        ) : (
          c.title || (
            <FormattedMessage
              defaultMessage={'Untitled'}
              description="Título predeterminado para sesiones de chat sin título"
            />
          )
        )}
      </strong>
      {props.selected && (
        <Menu>
          <Menu.Target>
            <ActionIcon color="green">
              <i className="fa fa-bars" style={{ fontSize: '80%' }} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={onEditTitle} icon={<i className="fa fa-edit" />}>
              <FormattedMessage defaultMessage={'Editar título'} />
            </Menu.Item>
            <Menu.Item
              onClick={onDelete}
              color="red"
              icon={<i className="fa fa-trash" />}
            >
              <FormattedMessage defaultMessage={'Borrar este chat'} />
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
      {editingTitle && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outline"
            onClick={onCancelEditTitle}
            style={{ marginRight: '1.0rem' }}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={onSaveTitle}
            style={{ marginRight: '2.0rem' }}
          >
            Guardar
          </Button>
        </div>
      )}
    </ChatListItemLink>
  );
}

export default function RecentChats(props: any) {
  const context = useAppContext();
  const dispatch = useAppDispatch();

  const currentChatID = context.currentChat.chat?.id;
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);

  const recentChats = context.chat.search.query(searchQuery);
  const [selectedChatIndex, setSelectedChatIndex] = useState(-1);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.currentTarget.closest('button')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (window.matchMedia('(max-width: 43em)').matches) {
        dispatch(toggleSidebar());
      }
    },
    [dispatch]
  );

  useEffect(() => {
    // Identifica el chat seleccionado
    const selectedChat = recentChats.find(c => c.chatID === currentChatID);

    // Si el chat seleccionado no es el primer elemento de la lista, muévelo al principio
    if (selectedChat) {
      const index = recentChats.indexOf(selectedChat);
      if (index !== 0) {
        recentChats.splice(index, 1);
        recentChats.unshift(selectedChat);
        setSelectedChatIndex(0);
      } else {
        setSelectedChatIndex(index);
      }
    } else {
      setSelectedChatIndex(-1);
    }
    if (currentChatID) {
      const el = document.querySelector(`[data-chat-id="${currentChatID}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentChatID, recentChats]);

  const handleChatSelection = useCallback(
    (chatID: string, index: number) => {
      if (chatID === currentChatID) {
        setSelectedChatIndex(index);
      } else {
        setSelectedChatIndex(-1);
      }
    },
    [currentChatID]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setSelectedChatIndex(-1);
    setScrollPosition(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedChatIndex(-1);
    setScrollPosition(0);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollTop + clientHeight === scrollHeight;
    if (isAtBottom) {
      // handle reaching bottom of scroll
    }
  };

  return (
    <Container>
      <Input
        placeholder="Buscar entre los chats"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginTop: '1rem', marginBottom: '1rem' }}
      />
      {searchQuery && (
        <Button variant="filled" onClick={handleClearSearch}>
          Borrar búsqueda
        </Button>
      )}
      {recentChats.length > 0 && (
        <ChatList onScroll={handleScroll}>
          {recentChats.map((c, index) => (
            <ChatListItem
              key={c.chatID}
              chat={c}
              onClick={onClick}
              selected={c.chatID === currentChatID}
              index={index}
              selectedIndex={selectedChatIndex}
              onSelect={handleChatSelection}
            />
          ))}
        </ChatList>
      )}
      {recentChats.length === 0 && (
        <Empty>
          <FormattedMessage
            defaultMessage={'Aún no hay chats.'}
            description="Mensaje que se muestra en la pantalla Historial de chat para nuevos usuarios que no han iniciado su primera sesión de chat"
          />
        </Empty>
      )}
    </Container>
  );
}
