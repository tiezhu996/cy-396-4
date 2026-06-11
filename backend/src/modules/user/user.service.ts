import { Injectable } from '@nestjs/common';
import { ActivityType, FavoriteTargetType } from '../../constants/enums';

type Follow = { userId: number; authorId: number };
type Favorite = { userId: number; targetType: FavoriteTargetType; targetId: number };

type Activity = {
  id: number;
  userId: number;
  type: ActivityType;
  data: Record<string, any>;
  createdAt: number;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class UserService {
  private follows: Follow[] = [];
  private favorites: Favorite[] = [];
  private activities: Activity[] = [];
  private nextActivityId = 1;

  follow(userId: number, authorId: number) {
    const existing = this.follows.find((item) => item.userId === userId && item.authorId === authorId);
    if (existing) return { userId, authorId, message: '已关注' };
    this.follows.push({ userId, authorId });
    return { userId, authorId, message: '关注成功' };
  }

  favorite(userId: number, targetType: FavoriteTargetType, targetId: number) {
    const existing = this.favorites.find(
      (item) => item.userId === userId && item.targetType === targetType && item.targetId === targetId,
    );
    if (existing) return { userId, targetType, targetId, message: '已收藏' };
    this.favorites.push({ userId, targetType, targetId });
    return { userId, targetType, targetId, message: '收藏成功' };
  }

  private cleanupOldActivities(): void {
    const cutoff = Date.now() - THIRTY_DAYS_MS;
    this.activities = this.activities.filter((activity) => activity.createdAt >= cutoff);
  }

  addActivityForFollowers(authorId: number, type: ActivityType.AuthorNewTutorial, data: { tutorialId: number; tutorialTitle: string }): void;
  addActivityForFollowers(authorId: number, type: ActivityType, data: Record<string, any>): void {
    this.cleanupOldActivities();
    const followers = this.follows.filter((item) => item.authorId === authorId).map((item) => item.userId);
    const now = Date.now();
    for (const userId of followers) {
      this.activities.push({
        id: this.nextActivityId++,
        userId,
        type,
        data,
        createdAt: now,
      });
    }
  }

  addActivityForFavoriters(productId: number, type: ActivityType.FavoriteProductStockChange, data: { productId: number; productName: string; oldStock: number; newStock: number }): void;
  addActivityForFavoriters(productId: number, type: ActivityType, data: Record<string, any>): void {
    this.cleanupOldActivities();
    const favoriters = this.favorites
      .filter((item) => item.targetType === FavoriteTargetType.Product && item.targetId === productId)
      .map((item) => item.userId);
    const now = Date.now();
    for (const userId of favoriters) {
      this.activities.push({
        id: this.nextActivityId++,
        userId,
        type,
        data,
        createdAt: now,
      });
    }
  }

  feed(userId: number) {
    this.cleanupOldActivities();
    const userActivities = this.activities
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
    const userFollows = this.follows.filter((item) => item.userId === userId);
    return { follows: userFollows, activities: userActivities };
  }

  getFollows(): Follow[] {
    return this.follows;
  }

  getFavorites(): Favorite[] {
    return this.favorites;
  }
}
