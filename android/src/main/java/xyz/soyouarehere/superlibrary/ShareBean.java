package xyz.soyouarehere.superlibrary;

import android.os.Bundle;

import java.io.Serializable;

/**
 * Created by Administrator on 2017/12/19.
 */

public class ShareBean implements Serializable{
    String title;
    String type;
    String description;
    String webpageUrl;
    String imageUrl;

    public ShareBean(Builder builder) {
        this.type = builder.type;
        this.title = builder.title;
        this.description = builder.description;
        this.webpageUrl = builder.webpageUrl;
        this.imageUrl = builder.imageUrl;
    }

    @Override
    public String toString() {
        return "ShareBean{" +
                "title='" + title + '\'' +
                ", type='" + type + '\'' +
                ", description='" + description + '\'' +
                ", webpageUrl='" + webpageUrl + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }

    public String getTitle() {
        return title;
    }

    public String getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public String getWebpageUrl() {
        return webpageUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public static class Builder{

        String title;
        String type;
        String description;
        String webpageUrl;
        String imageUrl;

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder webpageUrl(String webpageUrl) {
            this.webpageUrl = webpageUrl;
            return this;
        }

        public Builder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }
        public ShareBean builder(){
            return new ShareBean(this);
        }
    }

}
