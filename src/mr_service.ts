import axios from 'axios';
import {MergeRequest, Reviewer} from './types';
import { groupBy } from 'lodash';

export class MergeRequestAPI {
	private GROUP_ID = process.env.GROUP_ID!;
	private ACCESS_TOKEN = process.env.ACCESS_TOKEN!;
	private BASE_URL = 'https://gitlab.com/api/v4';

	constructor() {
		if (!this.ACCESS_TOKEN) {
			throw new Error('Env var ACCESS_TOKEN not defined');
		}

		if (!this.GROUP_ID) {
			throw new Error('Env var GROUP_ID not defined');
		}
	}

	async fetchOpenedMRs(): Promise<MergeRequest[]>{
		const url = `${this.BASE_URL}/groups/${this.GROUP_ID}/merge_requests?state=opened`;
		const data = await axios.get(url, {
			headers: {
				['PRIVATE-TOKEN']: this.ACCESS_TOKEN,
			},
		});

		return data.data;
	}

	async assignMergeRequest(pId: number, mrId: number, reviewerId: number): Promise<void> {
		const url = `${this.BASE_URL}/projects/${pId}/merge_requests/${mrId}`;
		const res = await axios.put(url, {
			reviewer_ids: [reviewerId],
		}, {
			headers: {
				['PRIVATE-TOKEN']: this.ACCESS_TOKEN,
			},
		});
	}

	async fetchMrCountByReviewer(): Promise<Reviewer[]> {
		const mrs = await this.fetchOpenedMRs();
		const groupedMrsByReviewer = groupBy(mrs, (mr) => mr.author.id);
		const reviewersWithMrCount = Object.keys(groupedMrsByReviewer).reduce((arr, key) => {
			const mrsArr = groupedMrsByReviewer[key];
			const { reviewers } = mrsArr[0];
			const reviewer = reviewers[0];
			
			if (!reviewer) {
				return arr;
			}

			arr.push({
				id: reviewer.id,
				username: reviewer.username,
				load: mrsArr.length,	
			});

			return arr;
		}, [] as Reviewer[]);

		return reviewersWithMrCount;
	}
}
