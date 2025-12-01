import { memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from '@nextui-org/react';
import { RiArrowLeftSLine, RiUser2Line } from '@remixicon/react';
import { Navigate, useNavigate } from 'react-router-dom';

import classes from './WhatsNewPage.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { HStack, VStack } from '@/shared/ui/Stack';
import { getUserData } from '@/entities/User';
import { Helmet } from '@/widgets/Helmet';
import { RoutePath } from '@/shared/config/routeConfig';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface WhatsNewPageProps {
    className?: string;
}

const WhatsNewPage = memo((props: WhatsNewPageProps) => {
    const { className } = props;

    const userData = useSelector(getUserData);
    const navigate = useNavigate();

    const { width } = useWindowWidth();

    const mods: Mods = {
        [classes.fullPage]: !userData,
    };

    const handleAuthPageClick = useCallback(() => {
        navigate(RoutePath.login);
    }, [navigate]);

    if (width > 0 && width < 1010) {
        return <Navigate to={RoutePath.main} />;
    }

    return (
        <Page className={classNames(classes.WhatsNewPage, mods, [className])}>
            <Helmet
                title="Обновления | Научное сообщество"
                description="Обновления системы учета научной деятельности. Здесь вы найдете информацию об обновлении проекта."
            />

            <HStack gap="24px" maxW align="center" className="mb-5">
                {!userData && (
                    <Tooltip classNames={{ content: 'text-primary' }} content="Авторизация">
                        <Button
                            size="sm"
                            onClick={handleAuthPageClick}
                            className="bg-opacity-50 bg-green-600 self-end"
                        >
                            <RiArrowLeftSLine />
                        </Button>
                    </Tooltip>
                )}
                <h1 className="text-2xl italic font-bold text-green-400">Вышло обновление!</h1>
            </HStack>

            <VStack gap="36px" maxW align="start" className="overflow-y-auto relative">
                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 2.2.1 от 29.11.2025 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Исправление ошибок
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Нашлись умники, которые писали в username очень странные символы,
                                в т.ч. кириллицу и пробелы. Мы, конечно же, рассчитывали на
                                вменяемую аудиторию, к которой нужно предъявлять минимум контроля.
                                Теперь все формы на регистрацию, авторизацию и смену пароля очень
                                жестко валидируются. Настоятельно рекомендуем сменить пароль, потому
                                что вскоре некоторые не смогут войти в аккаунту
                                <br />
                                -Кстати да, все аккаунты с невалидными логина мы удалили :(
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 2.2.0 от 25.11.2025 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавили два обязательных для заполнения поля: контрольные вопрос
                                и ответ. Это очень нужно для возможности восстановить пароль, если
                                вдруг (!) забыли
                                <br />- Добавили возможность сброса пароля
                                <br />- Пока Вы не выберете контрольный вопрос и не введете на него
                                ответ, Вам будет недоступно использование приложения
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 2.1.1 от 17.11.2025 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавили возможность редактирование аватарки профиля поользователя
                                и команды (почему не сделали сразу?)
                            </h4>
                        </div>
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Исправление ошибок
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Исправили ошибку, при которой могло не отображаться уведомление об
                                отсутствии сертификатов на странице пользователя
                                <br />- Исправили ошибку, при которой любой (-_-) вользователь мог
                                удалить сертификат другого пользователя
                                <br />- Исправили ошибку, при которое некорректно ообновлялась
                                информация о пользователе (скиллы и позиции)
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 2.1.0 от 15.11.2025 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавили возможность загрузки сертификатов/грамот и пр. в профиль
                                пользователя, чтобы все видели, какой вы крутой!
                                <br />- Добавленные файлы может скачать любой пользователь, имеющий
                                подтвержденную учетную запись на платформе
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 2.0.0 от 27.09.2025 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                <b>Редизайн и локальная версия!</b>
                                <br />- Приложение адаптировано для локального использования. Это
                                внесло некоторые ключевые изменения в логику работы, пришлось
                                вырезать некоторые функции, которые, в целом, никак не повлияют на
                                опыт использования.
                                <br />- Добавили новую цветовую схему (светлая) для соблюдения
                                корпоративного дизайна. Предпочитаемую схему Вы можете переключить в
                                настройках, а так же указать предпочтение на использование системной
                                темы устройства.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 1.1.0 от 06.10.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - <b>Мобильная версия!</b>
                                <br />- Успевшие протестировать декстопное приложение пользователи
                                очень просили мобильную версию. Что ж, возьмите-распишитесь.
                                Некоторый функционал по-прежнему недоступен в мобильной версии
                                (например, фильтрация команд), но мы все добавим, просто чуть позже.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 1.0.1 от 04.10.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Исправление ошибок
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Исправили некоторые UX моменты, список участников проекта должен
                                стать оптимизированнее;
                                <br />- В письме-оповещении о новом событии ссылка вела на
                                недействительную страницу, теперь мы это исправили.
                                <br />
                                <br />
                                День релиза выдался очень удачным, продолжайте репортить баги, и мы
                                вместе создадим лучший продукт
                            </h4>
                        </div>
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - В командных чатах теперь есть возможность выбора горячих клавиш
                                для отправки сообщения (по умолчанию Ctrl + Enter);
                                <br />- Список уведомлений стал выглядеть лучше. Содержание
                                уведомлений так же обновлено в лучшую сторону;
                                <br />- Добавлена возможность создавать пользовательские позиции и
                                навыки в Личном кабинете. Однако при создании помните про правила
                                сообщества. <br />
                                Около созданного навыка / позиции будет иконка{' '}
                                <RiUser2Line className="text-green-700 inline" />, которая будет
                                означать, что данные добавлены сообществом, а не модерацией проекта.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5 mb-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 1.0.0 от 04.10.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Релиз первой публичной бета версии приложения!
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Платформа <b>VKAHUB</b> — сервис учета научной деятельности.
                                Объединяйтесь в команды, участвуйте и побеждайте в соревнованиях,
                                планируйте выступления в командном чате, получайте достижения и
                                удовольствие!
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - <b>Командный чат!</b> На вкладке "Команда" в Личном кабинете
                                появилась ссылка на страницу командного чата. Обсуждайте предстоящие
                                соревнования, делитесь файлами и эмоциями.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.6.0 от 30.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - <b>Блокировка пользователей!</b> Это случилось! Мы добавили
                                автоматическую блокировку команд, которые не указали результаты
                                прошедших соревнований. Чтобы избежать блокировки, у Вас будет 24
                                часа на внесение результатов выступления;
                                <br />- Так же блокировка предусмотрена в ручном режиме для
                                пользователей, которые нарушают правила сообщества (ознакомиться с
                                ними можно на странице "Правила соощества". Изучите их перед тем,
                                как сделать необдуманный поступок ;)
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.5.1 от 28.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Теперь каждый участник коммьюнити может посмотреть достижения
                                другого участника. Иконки достижений выводятся аккуратно под
                                аватаром пользователя на странице профиля. Скорее смотрите, чего
                                достигли Ваши друзья, и стремитесь к большему!
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.5.0 от 26.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - <b>Уведомления прямо здесь и сейчас!</b> Вас позвали в команду?
                                Или, может быть, Вы капитан, и к вам в команду кто-то попросился? А
                                может быть, Вы получили новое достижение? Теперь всегда можно
                                посмотреть актуальные события с вашим профилем. Мы добавили
                                уведомления!
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.4.0 от 26.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - <b>Переработанные достижения профиля!</b> Всегда очень интересно
                                следить за своими достижениями. Мы решили дать Вам возможность
                                зарабатывать достижения профиля, которые будут видны Вам на
                                отдельной странице и, если поступят такие предложения, другим
                                пользователям. Обновление не такое крупное, как хотелось бы, но Вы
                                бы только знали, сколько кода ради этого написано)
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                В будущих версиях
                            </h3>
                            <h4 className="text-l leading-snug">
                                - В перспективе выдавать награды за полученные достижения. Например,
                                разбан команды для участия или особое выделение профиля или команды
                                в общем списке.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.3.0 от 25.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - <b>Встречайте отзывы и предложения!</b> Нам очень важно Ваше
                                мнение о нашем проекте, поэтому мы добавили раздел "Обратная связь".
                                Его можно найти, нажав на свой аватар в правом верхнем углу экрана;
                                <br />- Так же, если Вы столкнулись с ошибкой на сайте, которая Вас
                                раздаражет или портит впечатление от использования, Вы так же можете
                                сообщить об этом в соответствующем разделе;
                                <br />- Как только мы примем решение по Вашему предложению или
                                проблеме, мы ответим Вам на почту или в личных сообщениях через
                                телеграм (в будущих версиях).
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.2.2 от 25.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Изменили карточку просмотра своей команды, добавлили возможность
                                редактировать название и описание команды;
                                <br />- Добавили обязательное к заполнению поле "Место дислокации" в
                                настройках команды — это место, где команда будет находиться во
                                время соревнований;
                                <br />- Добавили поле "Требуемые должности" в команду — так
                                участники без команды смогут точнее найти себе подходящий коллектив.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.2.1 от 23.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Полный редизайн страниц профиля пользователя и команды. Везде
                                добавили скелетоны на загрузку контента.
                            </h4>
                        </div>
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Ошибки
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Нашли много ошибок, устаревшего кода и неиспользуемых функций
                                приложения. Начинаем предрелизную зачистку проекта.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.2.0 от 22.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - <b>Встречайте события!</b> Мы добавили три различных типа
                                соревнований в наш сервис: хакатоны, CTF и прочие соревнования;
                                <br />- У каждого соревнования теперь есть треки: вы можете
                                просматривать их, оценивать востребованность трека и
                                регистрироваться для участия в нем;
                                <br />
                                <br />- <b>Встречайте достижения!</b> После того, как мероприятие
                                прошло, нужно подвести итоги: капитаны команд могут (и должны)
                                отчитаться за проведенное соревнование, добавив результат. Он будет
                                отображаться как в профиле команды, так и в профиле каждого члена
                                команды;
                                <br />- Так же введены санкции для команд, которые не отчитались о
                                проведенных соревнованиях. Команда не может принять участие в
                                следюущем соревновании, пока не укажет результаты предыдущего. Если
                                этого будет мало — через неделю после завершения соревнования, о
                                котором отсутствует отчет, команда будет забанена на сайте и не
                                сможет выступать под своим названием. Участникам команды будет
                                доступна возможность покинуть команду и создать новую. Но не
                                злоупотребляйте этой возможностью, поскольку для членов команды так
                                же предусмотрены баны ;)
                                <br /> - Мы добавили нормально работающую логику ролей на сайте.
                                После регистрации и потверждения почты, аккаунту присваивается роль
                                "Почта подтверждена", после подтверждения личности — "Личность
                                подтверждена". После получения двух этих статусов пользователю
                                открывается доступ ко всем функциям приложения.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.12 от 16.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Изменили логику добавления в команду: теперь это именно
                                приглашение, которое отображается в личном кабинете пользователя;
                                <br />
                                - Теперь так же можно "попроситься" в команду — капитан команды
                                увидит ваш запрос и примет командирское решение;
                                <br />- И запрос, и приглашение можно как принять, так и отклонить;
                                <br />- Если в команду можно вступить, то, очевидно, должна быть
                                возможность покинуть ее. Такой функционал мы тоже добавили;
                                <br />- Поработали так же над UX: теперь вкладки, которые вы
                                открываете в личном кабинете сохраняются, и при перезагрузки
                                страницы открываются автоматически.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.11 от 14.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Переработали систему фильтрации команд и пользователей. Она стала
                                более оптимизированной и менее ресурсозатратной;
                                <br />
                                - Добавили логику верификации аккаунта;
                                <br />- Написали логику добавления в команду и передачи капитанства.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.10 от 13.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Начали делать систему достижений профиля;
                                <br />- Изменили права доступа на приглашение в команду;
                                <br />- На эту страницу добавили кнопку, которая возвращает на экран
                                авторизации, если пользователь попал сюда неавторизованным;
                                <br />- Немного изменили внешний вид карточки "Моя команда" в
                                профиле;
                                <br />- Добавили страницу и первые 13 достижений.
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Исправление ошибок
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Обнаружена и исправлена ошибка: кнопка "Выйти" в меню была меньше
                                блока, который для нее выделялся. Из-за этого не всегда получалось
                                "попасть" по кнопке
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.9 от 12.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавили изменение данных профиля (верификацию пользователя);{' '}
                                <br />
                                - Добавили функционал отправления приглашения в команду.
                                <br />
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Исправление ошибок
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Обнаружена и исправлена ошибка: если авторизованный пользователь
                                пытался попасть на страницу /login, это вызывало 500 ошибку; <br />-
                                Исправили ошибку со временем жизни токена доступа и невозможность
                                его автоматического обновления.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.8 от 11.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Еще раз переработали меню; <br />
                                - Добавили блоки "Навыки", "Личные данные", "Данные аккаунта" на
                                страницу профиля;
                                <br />
                                - Добавили логику создания команды; <br />
                                - Добавили кнопочку обновления списка команд; <br />- Немного
                                изменили компонент загрузки картинок.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.7 от 11.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Переработали меню, которое открывается по нажатии на аватарку
                                профиля.
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Исправление ошибок
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Исправили баг, который добавили в прошлой версии
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.6 от 11.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавили подтверждения почты, нарисовали красивые письма, провели
                                профилактические работы;
                                <br />- Добавили один баг, чтобы было, над чем работать.
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                В будущих версиях
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавим приглашения в команды, создание команд и далее по списку.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.5 от 10.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Первый деплой клиента на сервер. Настроен прокси-сервер, подлючен
                                домен и SSL-сертификат
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                В будущих версиях
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавим приглашения в команды, создание команд и далее по списку.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.4 от 09.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Исправление ошибок
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Обнаружена и исправлена ошибка, касающаяся UX приложения при
                                перезагрузке страницы
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.3 от 09.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Если Вы забыли пароль, теперь его можно восстановить. На экране
                                авторизации стала доступна кнопка{' '}
                                <span className="italic">"Я забыл пароль"</span>;
                                <br />- Изменения коснулись и этой странички. Теперь она доступная
                                неавторизованным пользователям.
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                В будущих версиях
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавим приглашения в команды, создание команд и далее по списку.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.2 от 07.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавили страницу детального просмотра профиля пользователя.
                                <br />
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                В будущих версиях
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавим приглашения в команды, создание команд и далее по списку.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.1 от 05.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавили страницу пользователей с возможностью поиска по ФИО,
                                присутствию в команде, направлению работы и используемому языку.{' '}
                                <br />
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                В будущих версиях
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавим детальную страницу профиля пользователя, приглашения в
                                команды, создание команд и далее по списку.
                            </h4>
                        </div>
                    </VStack>
                </HStack>

                <HStack maxW align="start" className="grid grid-cols-5">
                    <div className="col-span-1 sticky top-1">
                        <h1 className="text-xl leading-tight">Версия 0.1.0 от 05.09.2024 г.</h1>
                    </div>
                    <VStack maxW gap="24px" className="col-span-4">
                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                Новые функции
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Реализованы базовые потребности человечества: авторизация и
                                регистрация; <br />
                                - Добавили страницу команд с возможностью поиска команд по названию,
                                количеству участников и необходимых кадрах; <br />
                                - Добавили возможность изменять представление списка команд (списком
                                или сеткой); <br />
                                - Добавили страницу просмотра подробной информации о команде; <br />
                                - Добавили страницу обновлений и уведомление об обновлении. <br />
                            </h4>
                        </div>

                        <div>
                            <h3 className="mb-1.5 text-l font-bold italic underline underline-offset-4">
                                В будущих версиях
                            </h3>
                            <h4 className="text-l leading-snug">
                                - Добавим список участников проекта, просмотры профиля, приглашения
                                в команды, создание команд и далее по списку.
                            </h4>
                        </div>
                    </VStack>
                </HStack>
            </VStack>
        </Page>
    );
});

export default WhatsNewPage;
