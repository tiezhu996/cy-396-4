import { Injectable } from '@nestjs/common';
import { ActivityType, TutorialStatus } from '../../constants/enums';
import { UserService } from '../user/user.service';

type Tutorial = {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  status: TutorialStatus;
  materials: string[];
  steps: string[];
  views: number;
  favorites: number;
  authorId: number;
};

@Injectable()
export class TutorialService {
  private tutorials: Tutorial[] = [
    { id: 1, title: '入门编织杯垫', category: 'knitting', difficulty: 'beginner', status: TutorialStatus.Published, materials: ['棉线', '钩针'], steps: ['起针', '钩织主体', '收边'], views: 210, favorites: 32, authorId: 101 },
  ];

  constructor(private readonly userService: UserService) {}

  create(payload: Omit<Tutorial, 'id' | 'views' | 'favorites'>) {
    const tutorial: Tutorial = { ...payload, id: Date.now(), views: 0, favorites: 0 };
    this.tutorials.push(tutorial);
    if (tutorial.status === TutorialStatus.Published) {
      this.userService.addActivityForFollowers(tutorial.authorId, ActivityType.AuthorNewTutorial, {
        tutorialId: tutorial.id,
        tutorialTitle: tutorial.title,
      });
    }
    return tutorial;
  }

  search(query: { category?: string; difficulty?: string; keyword?: string }) {
    return this.tutorials.filter(
      (item) =>
        (!query.category || item.category === query.category) &&
        (!query.difficulty || item.difficulty === query.difficulty) &&
        (!query.keyword || item.title.includes(query.keyword)),
    );
  }

  updateStatus(id: number, status: TutorialStatus) {
    const tutorial = this.tutorials.find((item) => item.id === id);
    if (!tutorial) return null;
    const wasPublished = tutorial.status === TutorialStatus.Published;
    tutorial.status = status;
    if (!wasPublished && status === TutorialStatus.Published) {
      this.userService.addActivityForFollowers(tutorial.authorId, ActivityType.AuthorNewTutorial, {
        tutorialId: tutorial.id,
        tutorialTitle: tutorial.title,
      });
    }
    return tutorial;
  }

  hot() {
    return [...this.tutorials].sort((a, b) => b.views + b.favorites - (a.views + a.favorites)).slice(0, 10);
  }

  findById(id: number): Tutorial | undefined {
    return this.tutorials.find((item) => item.id === id);
  }
}
