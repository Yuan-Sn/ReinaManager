import { useState, useRef } from 'react';
import Stack from '@mui/material/Stack';
import { ThemeSwitcher } from '@toolpad/core/DashboardLayout';
import GamesIcon from '@mui/icons-material/Games';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import AddModal from '@/components/AddModal';
import SortModal from '@/components/SortModal';
import { FilterModal } from '@/components/FilterModal';
import { Link, useLocation, useParams } from 'react-router';
import { LaunchModal } from '@/components/LaunchModal';
import Button from '@mui/material/Button';
import { handleOpenFolder, isCustom, openurl } from '@/utils';
import { useStore } from '@/store';
import type { HanleGamesProps } from '@/types';
import { AlertDeleteBox } from '@/components/AlertBox';
import { useTranslation } from 'react-i18next';
import { isTauri } from '@tauri-apps/api/core';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CallMadeIcon from '@mui/icons-material/CallMade';

interface ButtonGroupProps {
    isLibraries: boolean;
    isDetail: boolean;
}

export const useModal = () => {
    const [isopen, setisopen] = useState(false);
    const previousFocus = useRef<HTMLElement | null>(null);

    const handleOpen = () => {
        // Store the currently focused element before opening modal
        previousFocus.current = document.activeElement as HTMLElement;
        setisopen(true);
    };

    const handleClose = () => {
        setisopen(false);
        // Return focus to the previous element after modal closes
        if (previousFocus.current) {
            previousFocus.current.focus();
        }
    };
    return { isopen, handleOpen, handleClose };
}

export const ToLibraries = () => {
    const { t } = useTranslation();
    return (
        <>
            <Button
                component={Link}
                to="/libraries"
                startIcon={<GamesIcon />}
                color="primary"
                variant="text"
            >
                {t('components.Toolbar.gameLibrary')}
            </Button>
            <ThemeSwitcher />
        </>
    );
}

const OpenFolder = ({ id, getGameById, canUse }: HanleGamesProps) => {
    const { t } = useTranslation();

    return (
        <Button
            startIcon={<FolderOpenIcon />}
            color="primary"
            variant="text"
            disabled={typeof canUse === 'function' ? !canUse() : true}
            onClick={() =>
                handleOpenFolder({ id, getGameById })
            }
        >
            {t('components.Toolbar.openGameFolder')}
        </Button>
    )
}

export const DeleteModal: React.FC<{ id: string }> = ({ id }) => {
    const { t } = useTranslation();
    const [openAlert, setOpenAlert] = useState(false);
    const { deleteGame } = useStore();

    const handleDeleteGame = () => {
        if (id) {
            deleteGame(id);
            window.location.href = '/#/libraries';
        }
    }
    return (
        <>
            <Button
                startIcon={<DeleteIcon />}
                color="error"
                variant="text"
                onClick={() => setOpenAlert(true)}
            >
                {t('components.Toolbar.deleteGame')}
            </Button>
            <AlertDeleteBox open={openAlert} setOpen={setOpenAlert} onConfirm={handleDeleteGame} />
        </>
    )
}

const MoreButton = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const isvndb = id?.includes('v') || false;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleView = (type: string) => {
        if (type === "bgm") {
            openurl(`https://bgm.tv/subject/${id}`);
        } else if (type === "vndb") {
            openurl(`https://vndb.org/${id}`);
        }
    }
    console.log(isCustom(id))
    return (
        <>
            <Button
                startIcon={<MoreVertIcon />}
                color="inherit"
                variant="text"
                onClick={handleClick}
            >
                更多
            </Button>
            <Menu
                id="more-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem
                    component={Link}
                    to={`/edit/${id}`}
                    onClick={() => {
                        handleClose();
                    }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('components.Toolbar.editModal')}</ListItemText>
                </MenuItem>
                <MenuItem disabled={isvndb || isCustom(id)} onClick={() => {
                    handleView("bgm");
                    handleClose();
                }}>
                    <ListItemIcon>
                        <CallMadeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('components.Toolbar.bgmlink')}</ListItemText>
                </MenuItem>
                <MenuItem disabled={!isvndb} onClick={() => {
                    handleView("vndb");
                    handleClose();
                }}>
                    <ListItemIcon>
                        <CallMadeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('components.Toolbar.vndblink')}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}

export const Buttongroup = ({ isLibraries, isDetail }: ButtonGroupProps) => {
    // 使用useParams获取URL参数
    const { id } = useParams<{ id: string }>();
    const { getGameById, useIsLocalGame } = useStore();

    // 确定是否可以启动游戏
    const canUse = () => {
        if (id !== undefined && id !== null)
            return isTauri() && useIsLocalGame(id);
        return false;
    }

    return (
        <>
            {(isDetail &&
                id) &&
                <>
                    <LaunchModal game_id={id} />
                    <OpenFolder id={id} getGameById={getGameById} canUse={canUse} />
                    <DeleteModal id={id} />
                    <MoreButton />
                </>
            }
            {isLibraries &&
                <>
                    <LaunchModal />
                    <AddModal />
                    <SortModal />
                    <FilterModal />
                    <ThemeSwitcher />
                </>
            }
        </>
    );
}

export const Toolbars = () => {
    const path = useLocation().pathname;
    const isLibraries = path === "/libraries";
    const isDetail = path.startsWith("/libraries/") && path !== "/libraries/";
    return (
        <Stack direction="row">
            <Buttongroup isLibraries={isLibraries} isDetail={isDetail} />
            {!isLibraries && <ToLibraries />}
        </Stack>
    );
}
