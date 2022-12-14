import {PriorityRoundRobin} from 'round-robin-js';
import { Reviewer } from './types';
import path from 'path';
import fs from 'fs';
import { unionBy } from 'lodash';

export class MRAssigner {
	private scheduler = new PriorityRoundRobin((a: any, b: any) => a.load - b.load);
	private reviewerMapById: Record<number, Reviewer> = {};

	addReviewer(reviewer: Reviewer): void {
		this.scheduler.add(reviewer);
		this.reviewerMapById[reviewer.id] = reviewer;
	}

	async initializeReviewers(reviewers: Reviewer[]): Promise<void> {
		const defaultReviewers = await this.getDefaultReviewers();
		const mergedReviewers = unionBy(reviewers, defaultReviewers, 'id');

		mergedReviewers.forEach((reviewer) => this.addReviewer(reviewer));
	}

	increaseLoadById(reviewerId: number): void {
		this.scheduler.deleteByValue((s: Reviewer) => s.id == reviewerId); // 2
		const reviewer = this.reviewerMapById[reviewerId];

		if (!reviewer) {
			throw new Error('Reviewer not found');
		}

		reviewer.load = reviewer.load + 1;

		this.reviewerMapById[reviewer.id] = reviewer;
		this.addReviewer(reviewer);
	}

	getReviewer(authorId: number): Reviewer | undefined {
		let entriesCount = this.scheduler.count();

		while (entriesCount > 0) {
			const reviewer =  this.scheduler.next().value as Reviewer;

			// If reviewer selected is not the author
			if (reviewer.id != authorId) {
				return reviewer;
			}

			entriesCount--;
		}

		return undefined;
	}

	private getDefaultReviewers(): Promise<Reviewer[]> {
		const jsonStr = fs.readFileSync(path.resolve(__dirname, './reviewers.json'), { encoding: 'utf-8'});
		return JSON.parse(jsonStr);
	}
}
