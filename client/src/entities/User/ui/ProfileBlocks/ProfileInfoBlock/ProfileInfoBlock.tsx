/**
 * Ну я же не много прошу: просто чтобы айдишник команды был. И все. Базовые потребности удовлетворить...
 */

import { useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Autocomplete,
    AutocompleteItem,
    AutocompleteSection,
    Button,
    Image,
    Input,
    Textarea,
    Tooltip,
} from '@nextui-org/react';
import { RiCloseLine, RiEditLine, RiSaveLine } from '@remixicon/react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { changeUserProfile } from '../../../model/services/profileServices/changeUserProfile';
import { getIsProfileChanging, getUserData } from '../../../model/selectors/UserSelectors';
import { UserRoles } from '../../../model/types/User';
import { RecoveryQuestionSelector } from '../../RecoveryPasswordModal/RecoveryQuestionSelector';
import { getRecoveryQuestions } from '../../../model/services/authServices/getRecoveryQuestions';
import {
    profileCompletionSchema,
    type UserProfileFormValues,
} from '../../../model/types/validationSchemas';

import classes from './ProfileInfoBlock.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { toastDispatch } from '@/widgets/Toaster';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { getUserDataService, getUserRoles } from '@/entities/User';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import { ImageUpload } from '@/shared/ui/ImageUpload';

interface ProfileInfoBlockProps {
    className?: string;
}

const soldiersRanks = ['курсант', 'мл. сержант', 'сержант', 'ст. сержант'];
const officersRanks = [
    'лейтенант',
    'ст. лейтенант',
    'капитан',
    'майор',
    'подполковник',
    'полковник',
];

export const ProfileInfoBlock = (props: ProfileInfoBlockProps) => {
    const { className } = props;

    const isProfileChanging = useSelector(getIsProfileChanging);

    const userData = useSelector(getUserData);
    const userRoles = useSelector(getUserRoles);
    const dispatch = useAppDispatch();

    const { isMobile } = useWindowWidth();

    const [isEditorMode, setIsEditorMode] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<File>();

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
    } = useForm<UserProfileFormValues>({
        resolver: yupResolver(profileCompletionSchema),
        mode: 'onChange',
        defaultValues: userData,
        context: {
            requireAnswer: !userData?.recoveryQuestion,
        },
    });

    useEffect(() => {
        dispatch(getRecoveryQuestions());
    }, [dispatch]);

    const isSaveButtonDisabled = useMemo(
        () => isProfileChanging || !isValid,
        [isProfileChanging, isValid],
    );

    const renderAlertMessage = useMemo(() => {
        if (!userRoles.includes(UserRoles.PROFILE_CONFIRMED)) {
            return (
                <p className="italic text-red-300">
                    * Пока Вы не пройдете верификацию аккаунта, Вам будет недоступна бо&#769;льшая
                    часть функций. Не удивляйтесь, если все ссылки введут на эту страницу
                </p>
            );
        }
        if (!userData?.recoveryQuestion) {
            return (
                <p className="italic text-red-300">
                    * Пока Вы не выберете пару контрольный вопрос-ответ, вам будет недоступно
                    использование приложения, т.к. разработчики устали удалять пользователей из-за
                    их забывчивости
                </p>
            );
        }
        if (userData?.firstname && !userRoles?.includes(UserRoles.PROFILE_CONFIRMED)) {
            return (
                <VStack maxW>
                    <p className="italic text-red-300">
                        * Ваш профиль находится на верификации. После прохождения этой процедуры,
                        Вам будут доступны все функции сервиса
                    </p>
                    {isEditorMode && (
                        <p className="italic text-orange-300">
                            * Если Вы внесете изменения, скорее всего, время ожидания верификации
                            увеличится
                        </p>
                    )}
                </VStack>
            );
        }

        if (!userRoles.includes(UserRoles.MAIL_CONFIRMED)) {
            return (
                <p className="italic text-red-300">
                    * Для доступа ко всем функциям приложения, Вам необходимо подтвердить почту. На
                    нее было выслано письмо с интрукциями
                </p>
            );
        }

        return null;
    }, [isEditorMode, userData?.firstname, userData?.recoveryQuestion, userRoles]);

    const handleChangeProfile = useCallback(
        async (profile: UserProfileFormValues) => {
            await toastDispatch(
                dispatch(changeUserProfile({ ...profile, newAvatar: avatar, id: userData?.id })),
            );

            await dispatch(getUserDataService());
            setIsEditorMode(false);
        },
        [avatar, dispatch, userData?.id],
    );

    const handleChangeEditorMode = useCallback(() => {
        if (!isEditorMode) {
            setIsEditorMode(true);
        }
    }, [isEditorMode]);

    const handleCancelChanges = useCallback(() => {
        setIsEditorMode(false);
        reset();
    }, [reset]);

    return (
        <form
            onSubmit={handleSubmit(handleChangeProfile)}
            className={classNames(classes.ProfileInfoBlock, {}, [className])}
        >
            <VStack gap="24px" maxW>
                <HStack maxW align="start">
                    <VStack maxW gap="0px">
                        <h1 className="text-primary text-l font-bold">Ваш профиль</h1>
                        {renderAlertMessage}
                    </VStack>

                    <HStack>
                        {isEditorMode ? (
                            <>
                                <Button
                                    type="submit"
                                    isDisabled={isSaveButtonDisabled}
                                    className="bg-green-100"
                                >
                                    <RiSaveLine className="text-green-600" />
                                </Button>
                                <Tooltip
                                    classNames={{
                                        content: 'dark:bg-primary',
                                        base: 'dark:before:bg-primary',
                                    }}
                                    content="Отменить изменения"
                                >
                                    <Button
                                        isDisabled={isProfileChanging}
                                        onClick={handleCancelChanges}
                                        className="bg-red-100"
                                    >
                                        <RiCloseLine className="text-red-500" />
                                    </Button>
                                </Tooltip>
                            </>
                        ) : (
                            <Tooltip
                                classNames={{
                                    content: 'dark:bg-primary',
                                    base: 'dark:before:bg-primary',
                                }}
                                content="Редактировать"
                            >
                                <Button
                                    type="button"
                                    onClick={handleChangeEditorMode}
                                    color="success"
                                    className="bg-opacity-50"
                                >
                                    <RiEditLine className="text-main" />
                                </Button>
                            </Tooltip>
                        )}
                    </HStack>
                </HStack>

                <HStack
                    className={isMobile ? 'flex flex-col' : 'flex-row-reverse'}
                    maxW
                    align="start"
                    gap="24px"
                >
                    {isEditorMode ? (
                        <ImageUpload
                            className="w-[200px] h-[200px]"
                            initialImage={
                                import.meta.env.DEV
                                    ? `http://localhost/user-avatars/${userData?.avatar}`
                                    : `/user-avatars/${userData?.avatar}`
                            }
                            onChange={setAvatar}
                        />
                    ) : (
                        <Image
                            fallbackSrc="/static/fallbacks/user-fallback.webp"
                            width={200}
                            height={200}
                            classNames={{ wrapper: classes.profileAvatar }}
                            src={
                                import.meta.env.DEV
                                    ? `http://localhost/user-avatars/${userData?.avatar}`
                                    : `/user-avatars/${userData?.avatar}`
                            }
                            alt="Аватар пользователя"
                        />
                    )}

                    <VStack maxW gap="12px">
                        <Controller
                            control={control}
                            name="lastname"
                            render={({ field }) => (
                                <Input
                                    isRequired
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    isDisabled={!isEditorMode || isProfileChanging}
                                    size="sm"
                                    label="Фамилия"
                                    isInvalid={Boolean(errors.lastname?.message)}
                                    errorMessage={errors.lastname?.message}
                                    classNames={{
                                        errorMessage: 'text-start text-red-400 font-bold',
                                    }}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="firstname"
                            render={({ field }) => (
                                <Input
                                    isRequired
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    isDisabled={!isEditorMode || isProfileChanging}
                                    size="sm"
                                    label="Имя"
                                    isInvalid={Boolean(errors.firstname?.message)}
                                    errorMessage={errors.firstname?.message}
                                    classNames={{
                                        errorMessage: 'text-start text-red-400 font-bold',
                                    }}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="middlename"
                            render={({ field }) => (
                                <Input
                                    isRequired
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    isDisabled={!isEditorMode || isProfileChanging}
                                    size="sm"
                                    label="Отчество"
                                    isInvalid={Boolean(errors.middlename?.message)}
                                    errorMessage={errors.middlename?.message}
                                    classNames={{
                                        errorMessage: 'text-start text-red-400 font-bold',
                                    }}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="recoveryQuestion"
                            render={({ field }) => (
                                <RecoveryQuestionSelector
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    isDisabled={
                                        !isEditorMode ||
                                        isProfileChanging ||
                                        Boolean(userData?.recoveryQuestion)
                                    }
                                />
                            )}
                        />

                        {!userData?.recoveryQuestion && (
                            <Controller
                                control={control}
                                name="recoveryAnswer"
                                render={({ field }) => (
                                    <Input
                                        isRequired
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        isDisabled={!isEditorMode || isProfileChanging}
                                        size="sm"
                                        label="Ответ на вопрос"
                                        isInvalid={Boolean(errors.recoveryAnswer?.message)}
                                        errorMessage={errors.recoveryAnswer?.message}
                                        classNames={{
                                            errorMessage: 'text-start text-red-400 font-bold',
                                        }}
                                    />
                                )}
                            />
                        )}

                        <Controller
                            control={control}
                            name="rank"
                            render={({ field }) => (
                                <Autocomplete
                                    isRequired
                                    selectedKey={field.value}
                                    onSelectionChange={field.onChange}
                                    label="Воинское звание"
                                    size="sm"
                                    isDisabled={!isEditorMode || isProfileChanging}
                                    className="w-full"
                                >
                                    <AutocompleteSection title="Курсантские звания">
                                        {soldiersRanks.map((rank) => (
                                            <AutocompleteItem
                                                classNames={{
                                                    title: 'text-main',
                                                }}
                                                key={rank}
                                            >
                                                {rank}
                                            </AutocompleteItem>
                                        ))}
                                    </AutocompleteSection>
                                    <AutocompleteSection title="Офицерские звания">
                                        {officersRanks.map((rank) => (
                                            <AutocompleteItem
                                                classNames={{
                                                    title: 'text-main',
                                                }}
                                                key={rank}
                                            >
                                                {rank}
                                            </AutocompleteItem>
                                        ))}
                                    </AutocompleteSection>
                                </Autocomplete>
                            )}
                        />

                        <Controller
                            control={control}
                            name="group_number"
                            render={({ field }) => (
                                <Input
                                    isRequired
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    isDisabled={!isEditorMode || isProfileChanging}
                                    size="sm"
                                    label="Учебная группа (подразделение)"
                                    isInvalid={Boolean(errors.group_number?.message)}
                                    errorMessage={errors.group_number?.message}
                                    classNames={{
                                        errorMessage: 'text-start text-red-400 font-bold',
                                    }}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <Textarea
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    classNames={{
                                        inputWrapper: 'h-full',
                                        errorMessage: 'text-start text-red-400 font-bold',
                                    }}
                                    minRows={isEditorMode ? 10 : 4}
                                    size="sm"
                                    isDisabled={!isEditorMode || isProfileChanging}
                                    label="О себе"
                                    placeholder="Необязательно, но желательно. Расскажите, чем занимаетесь или свою жизненную позицию"
                                    isInvalid={Boolean(errors.description?.message)}
                                    errorMessage={errors.description?.message}
                                />
                            )}
                        />
                    </VStack>
                </HStack>
            </VStack>
        </form>
    );
};
