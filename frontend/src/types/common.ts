export interface IAxiosResponse<T = unknown> {
    succeeded?: boolean;
    status?: boolean;
    data?: T;
    messages?: string[];
    meta?: IMeta;
}

export interface IMeta {
    code?: number;
    message?: string | string[];
    exception?: string;
    path?: string;
}

export interface IPaginationResponse<T = unknown> {
    data: T;
    pagination: IPaginationMeta;
}

export interface IPaginationMeta extends IPageParams {
    totalItems: number;
    totalPage: number;
}

export interface IPageParams {
    page: number;
    limit: number;
}

export type ISortOrder = 'ASC' | 'DESC';
export type ISortBy = 'createdAt' | 'updatedAt';
