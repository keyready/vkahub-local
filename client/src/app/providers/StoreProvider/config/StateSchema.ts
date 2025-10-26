import {
    AnyAction,
    CombinedState,
    EnhancedStore,
    Reducer,
    ReducersMapObject,
} from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';

import { UserSchema } from '@/entities/User';
import { UISchema } from '@/features/UI';
import { rtkApi } from '@/shared/api/rtkApi';
import { TeamSchema } from '@/entities/Team';
import { AchievementSchema } from '@/entities/Achievement';
import { ServiceUpdated } from '@/features/ServiceUpdated';
import { ProposalSchema } from '@/entities/Proposal';
import { EventSchema } from '@/entities/Event';
import { TrackSchema } from '@/entities/Track';
import { SkillSchema } from '@/entities/Skill';
import { BugSchema } from '@/entities/Bug';
import { FeedbackSchema } from '@/entities/Feedback';
import { NotificationSchema } from '@/entities/Notification';
import { TelegramSchema } from '@/features/Telegram';
import { PageScrollSchema } from '@/features/PageScroll';
import { ThemeSchema } from '@/widgets/ThemeSwitcher';

export interface StateSchema {
    ui: UISchema;
    serviceUpdated: ServiceUpdated;
    user: UserSchema;
    pageScroll: PageScrollSchema;
    theme: ThemeSchema;
    [rtkApi.reducerPath]: ReturnType<typeof rtkApi.reducer>;

    // asynchronous reducers
    team?: TeamSchema;
    achievement?: AchievementSchema;
    proposal?: ProposalSchema;
    event?: EventSchema;
    track?: TrackSchema;
    skill?: SkillSchema;
    bug?: BugSchema;
    feedback?: FeedbackSchema;
    notification?: NotificationSchema;
    message?: TelegramSchema;
}

export type StateSchemaKey = keyof StateSchema;
export type MountedReducers = OptionalRecord<StateSchemaKey, boolean>;
export interface reducerManager {
    getReducerMap: () => ReducersMapObject<StateSchema>;
    reduce: (state: StateSchema, action: AnyAction) => CombinedState<StateSchema>;
    add: (key: StateSchemaKey, reducer: Reducer) => void;
    remove: (key: StateSchemaKey) => void;
    getMountedReducers: () => MountedReducers;
}

export interface ReduxStoreWithManager extends EnhancedStore<StateSchema> {
    reducerManager: reducerManager;
}

export interface ThunkExtraArg {
    api: AxiosInstance;
}

export interface ThunkConfig<T> {
    rejectValue: T;
    extra: ThunkExtraArg;
    state: StateSchema;
}
