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
import { FaSave, FaTimes } from 'react-icons/fa';
import { debounce } from 'lodash';

const Container = styled.div`
  margin: calc(1.2rem - 0.8rem);
  margin-top: 0rem;
  margin-right: 0.43rem;
`;

const Empty = styled.p`
  text-align: center;
  font-size: 1.2rem;
  padding: 1rem;
`;

const ChatList = styled.div`
  max-height: 43rem;
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: #555555 #f5f5f5;
  padding-right: 3.5rem;

  &::-webkit-scrollbar {
    width: 15px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #555555;
    border-radius: 10px;
    border: 3px solid #f5f5f5;
  }

  @media (min-width: 768px) {
    * {
      touch-action: manipulation;
    }
  }
`;

const ChatListItemLink = styled(Link)`
  display: block;
  position: relative;
  padding: 0.2rem 0.8rem;
  margin: 0.1rem 0;
  line-height: 1.5;
  text-decoration: none;
  border-radius: 0.65rem;
  pointer-events: auto;

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
    font-size: 1.2rem;
    line-height: 1.8;
    padding-right: 0.8rem;
    color: white;
  }

  p {
    font-size: 0.6rem;
    font-weight: 200;
    opacity: 0.8;
  }

  .mantine-ActionIcon-root {
    z-index: 9999;
    position: absolute;
    right: 0.5rem;
    top: 50%;
    margin-top: -14px;
    margin-right: -2.93rem;
    pointer-events: auto;
    font-size: 34px;
  }

  @media (hover: hover) {
    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  @media (max-width: 768px) {
    * {
      touch-action: manipulation;
    }
  }

  .cancel-save-buttons {
    display: flex;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    .cancel-save-buttons {
      flex-direction: row;
      align-items: center;
    }
  }
`;

function ChatListItem(props: { chat: any; onClick: any; selected: boolean; index: number; selectedIndex: number; onSelect: (chatID: string, index: number) => void;}) {
  const c = props.chat;
  const context = useAppContext();
  const modals = useModals();
  const navigate = useNavigate();
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(c.title || '');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showIcons, setShowIcons] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowIcons(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setNewTitle(c.title || '');
  }, [c.title]);

  useEffect(() => {
    setEditingTitle(false);
  }, [props.chat.chatID, context.currentChat.chat?.id]);

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
          El chat "{c.title}" va a ser permanentemente borrado. Esto no se puede deshacer.
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
                El chat "{c.title}" no pudo ser borrado.
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
  }, [c.chatID, c.title, context.chat, modals, navigate]);

  const onEditTitle = useCallback(() => {
    setEditingTitle(true);
  }, []);

  const onSaveTitle = useCallback(async () => {
    try {
      setIsSavingTitle(true);
      await backend.current?.updateChatTitle(c.chatID, newTitle);
      context.chat.updateChatTitle(c.chatID, newTitle);
      setEditingTitle(false);
      setNewTitle(newTitle);
    } catch (e) {
      console.error(e);
      modals.openConfirmModal({
        title: 'Algo salió mal',
        children: (
          <p style={{ lineHeight: 1.7 }}>
            El título del chat "{c.title}" no pudo ser actualizado.
          </p>
        ),
        labels: {
          confirm: 'Intenta nuevamente',
          cancel: 'Cancelar',
        },
        onConfirm: onSaveTitle,
      });
    } finally {
      setIsSavingTitle(false);
    }
  }, [c.chatID, c.title, context.chat, modals, newTitle]);

  const onCancelEditTitle = useCallback(() => {
    setIsCancelling(true);
    setTimeout(() => {
      setIsCancelling(false);
      setNewTitle(c.title || '');
      setEditingTitle(false);
    }, 1000);
  }, [c.title]);

  const handleSaveClick = useCallback((callback) => {
    if (!isSavingTitle) {
      setIsSavingTitle(true);
      setTimeout(() => {
        setIsSavingTitle(false);
        callback();
      }, 1000);
    }
  }, [isSavingTitle]);

  const handleCancelClick = useCallback((callback) => {
    if (!isCancelling) {
      setIsCancelling(true);
      setTimeout(() => {
        setIsCancelling(false);
        callback();
      }, 1000);
    }
  }, [isCancelling]);

  const onDeleteWithDelay = useCallback(() => {
    setTimeout(() => {
      onDelete();
    }, 350);
  }, [onDelete]);

  const debouncedDelete = debounce(onDeleteWithDelay, 500, { leading: true, trailing: false });

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
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
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
            <ActionIcon type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); }}>
              <i className="fa fa-bars" style={{ fontSize: '83%' }} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown style={{ zIndex: 9999, position: 'fixed', top: 'auto', right: 'auto', left: 'auto', bottom: 'auto' }}>
            <Menu.Item onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEditTitle(); }} onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); onEditTitle(); }} color="green" icon={<i className="fa fa-edit" />}>
              <FormattedMessage defaultMessage={'Editar título'} />
            </Menu.Item>
            <Menu.Item onClick={(e) => { e.stopPropagation(); e.preventDefault(); debouncedDelete(); }} onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); debouncedDelete(); }} color="red" icon={<i className="fa fa-trash" />}>
              <FormattedMessage defaultMessage={'Borrar este chat'} />
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
      {editingTitle && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className={`cancel-save-buttons ${showIcons ? 'show-icons' : ''}`}>
          <Button
            variant="outline"
            className="cancel-button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleCancelClick(onCancelEditTitle)}}
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); handleCancelClick(onCancelEditTitle)}}
            style={{ marginRight: '1.0rem' }}
          >
            {showIcons ? <FaTimes /> : isCancelling ? 'Cancelando...' : 'Cancelar'}
          </Button>
          <Button
            variant="outline"
            className="save-button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleSaveClick(onSaveTitle)}}
            onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); handleSaveClick(onSaveTitle)}}
            style={{ marginRight: '2.0rem' }}
          >
            {showIcons ? <FaSave /> : isSavingTitle && !isCancelling ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 41 * 16);

  const recentChats = context.chat.search.query(searchQuery);
  const [selectedChatIndex, setSelectedChatIndex] = useState(-1);

  const onClick = useCallback(
    (e) => {
      if (e.currentTarget.closest('button')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (isMobile) {
        dispatch(toggleSidebar());
      }
    },
    [dispatch, isMobile]
  );

  useEffect(() => {
    const handleWindowResize = () => {
      setIsMobile(window.innerWidth <= 43 * 16);
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    const selectedChat = recentChats.find((c) => c.chatID === currentChatID);

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
        placeholder="Buscar chats"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginTop: '1rem', marginBottom: '1rem' }}
      />
      {searchQuery && (
        <Button variant="filled" onClick={handleClearSearch} style={{ marginBottom: '0.85rem'}} >
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
