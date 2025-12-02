import { Guidelines } from '../types/User';

export const GuidelinesValues: Guidelines[] = [
    { value: 'main-page', label: 'Главная страница', enabled: true },
    { value: 'events-page', label: 'Страница событий', enabled: true },
    { value: 'types-events-page', label: 'Страница типов событий', level: 2, enabled: true },
    { value: 'event-page', label: 'Страница одного события', level: 3, enabled: true },
    { value: 'teams-page', label: 'Страница команд', enabled: true },
    { value: 'team-page', label: 'Страница одной команды', level: 2, enabled: true },
    { value: 'users-page', label: 'Страница участников', enabled: true },
    { value: 'user-page', label: 'Страница одного участника', level: 2, enabled: true },
    { value: 'navbar-page', label: 'Навбар', enabled: true },
    { value: 'avatar-dropdown-page', label: 'Выпадающее меню аватарки', enabled: true },
    { value: 'feed-page', label: 'Личный кабинет', enabled: true },
    { value: 'feed-page-team', label: 'ЛК: раздел команды', level: 2, enabled: true },
    { value: 'feed-page-portfolio', label: 'ЛК: раздел портфолио', level: 2, enabled: true },
    { value: 'feed-page-proposals', label: 'ЛК: раздел заявок', level: 2, enabled: true },
];
