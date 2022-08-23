export type MergeRequest = {
	project_id: number;
	title: string;
	author: {
		id: number,
		name: string,
		username: string,
	};
	reviewers: Array<{
		id: number,
		name: string,
		username: string,
	}>;
}

export type Reviewer = {
	id: number;
	username: string;
	load: number;
}

export type MREvent = {
	project: {
		id: number;
	};
	user: {
		id: number;
		username: string;
		name: string;
	};
	object_attributes: {
		id: number;
		iid: number;
		author_id: number;
		title: string;
	}
};
