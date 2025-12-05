import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from '@nextui-org/react';
import { useCallback, useMemo } from 'react';
import {
    RiAdminLine,
    RiContractLine,
    RiGitPullRequestLine,
    RiLoginCircleLine,
    RiLogoutCircleLine,
    RiMedalLine,
    RiProfileLine,
    RiQuestionLine,
} from '@remixicon/react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import classes from './AvatarDropdown.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { AppLink } from '@/shared/ui/AppLink';
import { RoutePath } from '@/shared/config/routeConfig';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { getUserData, isUserAdmin, logoutService, UserActions } from '@/entities/User';
import { toastDispatch } from '@/widgets/Toaster';
import { TextButton } from '@/shared/ui/TextButton';
import { Image } from '@/shared/ui/Image';
import { ThemeSwitcher } from '@/widgets/ThemeSwitcher';

interface AvatarDropdownProps {
    className?: string;
}

export const AvatarDropdown = (props: AvatarDropdownProps) => {
    const { className } = props;

    const dispatch = useAppDispatch();
    const userData = useSelector(getUserData);
    const isAdmin = useSelector(isUserAdmin);
    const isAuth = Boolean(useSelector(getUserData).id);
    const navigate = useNavigate();

    const handleLogoutClick = useCallback(async () => {
        await toastDispatch(dispatch(logoutService()), {
            error: 'На стороне сервера произошла ошибка. Авторизуйтесь и повторите попытку',
            loading: 'Стираем данные...',
            success: 'До скорой встречи!',
        });
        dispatch(UserActions.logout());
    }, [dispatch]);

    const handleLoginClick = useCallback(async () => {
        navigate(RoutePath.login);
    }, [navigate]);

    const feedItems = useMemo(
        () => [
            <DropdownItem
                startContent={<RiProfileLine size={14} className="text-accent" />}
                key="feed"
            >
                <AppLink to={RoutePath.feed}>Личный кабинет</AppLink>
            </DropdownItem>,
            ...(isAuth
                ? [
                      <DropdownItem
                          startContent={<RiMedalLine size={14} className="text-accent" />}
                          key="achievements"
                      >
                          <AppLink to={RoutePath.achievements}>Достижения</AppLink>
                      </DropdownItem>,
                  ]
                : []),
        ],
        [isAuth],
    );

    const feedbackItems = useMemo(
        () => [
            ...(isAuth
                ? [
                      <DropdownItem
                          startContent={<RiQuestionLine size={14} className="text-accent" />}
                          key="about"
                      >
                          <AppLink to={RoutePath.feedback}>Обратная связь</AppLink>
                      </DropdownItem>,
                  ]
                : []),
            <DropdownItem
                startContent={<RiGitPullRequestLine size={14} className="text-accent" />}
                key="whats-new"
            >
                <AppLink to={RoutePath.changelogs}>Что нового?</AppLink>
            </DropdownItem>,

            <DropdownItem
                startContent={<RiContractLine size={14} className="text-accent" />}
                key="rules"
            >
                <AppLink to={RoutePath.rules}>Правила сообщества</AppLink>
            </DropdownItem>,
        ],
        [isAuth],
    );

    const renderDangerSectionItems = useMemo(
        () => [
            <DropdownItem closeOnSelect={false} key="app-theme">
                <ThemeSwitcher />
            </DropdownItem>,
            ...(isAdmin
                ? [
                      <DropdownItem
                          startContent={<RiAdminLine size={14} className="text-accent" />}
                          key="admin"
                      >
                          <AppLink to={RoutePath.admin}>Модерация</AppLink>
                      </DropdownItem>,
                  ]
                : []),
            ...(isAuth
                ? [
                      <DropdownItem
                          startContent={<RiLogoutCircleLine size={14} className="text-red-400" />}
                          key="logout"
                          textValue="logout"
                      >
                          <TextButton
                              className="no-underline w-full text-left text-red-400"
                              onClick={handleLogoutClick}
                          >
                              Выйти
                          </TextButton>
                      </DropdownItem>,
                  ]
                : [
                      <DropdownItem
                          startContent={
                              <RiLoginCircleLine size={14} className="text-success-400" />
                          }
                          key="logout"
                          textValue="login"
                      >
                          <TextButton
                              className="no-underline w-full text-left text-success-400"
                              onClick={handleLoginClick}
                          >
                              Войти
                          </TextButton>
                      </DropdownItem>,
                  ]),
        ],
        [handleLoginClick, handleLogoutClick, isAdmin, isAuth],
    );

    return (
        <div className={classNames(classes.AvatarDropdown, {}, [className])}>
            <Dropdown>
                <DropdownTrigger>
                    <Button className="min-w-0 h-fit px-0 py-0 rounded-full">
                        <Image
                            classNames={{
                                wrapper: classes.avatarImage,
                            }}
                            width={48}
                            height={48}
                            fallbackSrc="/static/fallbacks/user-fallback.webp"
                            src={`/minio/${userData?.avatar?.image}`}
                            hash={userData?.avatar?.hash}
                            className="rounded-full w-12 h-12"
                        />
                    </Button>
                </DropdownTrigger>

                <DropdownMenu closeOnSelect>
                    <DropdownSection showDivider aria-label="ЛК">
                        {feedItems}
                    </DropdownSection>

                    <DropdownSection showDivider aria-label="Обратная связь">
                        {feedbackItems}
                    </DropdownSection>

                    <DropdownSection aria-label="Сессия">
                        {renderDangerSectionItems}
                    </DropdownSection>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
};
