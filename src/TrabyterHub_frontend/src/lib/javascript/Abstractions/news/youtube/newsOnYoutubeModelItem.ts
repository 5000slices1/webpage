export class NewsOnYoutubeModelItem {
    public description: string;
    public thumbnailUrl: string;
    public videoUrl: string;
    public publishedAt: Date;

    constructor(description: string, thumbnailUrl: string, videoUrl: string, publishedAt: Date) {
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.videoUrl = videoUrl;
        this.publishedAt = publishedAt;
    }
}
