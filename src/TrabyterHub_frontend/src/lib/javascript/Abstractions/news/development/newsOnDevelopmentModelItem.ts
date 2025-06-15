export enum DevelopmentStatus {
    NotStarted = 'NotStarted',
    InProgress = 'InProgress',
    Completed = 'Completed',
}

export class NewsOnDevelopmentModelItem {
    public title: string;
    public description: string;
    public thumbnailUrl: string;
    public url: string;
    public developmentStatus: DevelopmentStatus;

    constructor(
        title: string,
        description: string,
        thumbnailUrl: string,
        url: string,
        developmentStatus: DevelopmentStatus,
    ) {
        this.title = title;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.url = url;
        this.developmentStatus = developmentStatus;
    }
}
