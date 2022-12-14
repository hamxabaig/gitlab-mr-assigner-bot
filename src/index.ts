/// <reference path="./index.d.ts" />
import express from 'express';
import { MRAssigner } from './assigner';
import bodyParser from 'body-parser';
import { MergeRequestAPI } from './mr_service';
import { MREvent } from './types';

const app = express()
const port = 3000

const SECRET_TOKEN = process.env.WEBHOOK_SECRET;
const assigner = new MRAssigner();
const mrApi = new MergeRequestAPI();

const initState = async (): Promise<void> => {
	try {
		const mrCount = await mrApi.fetchMrCountByReviewer();
		await assigner.initializeReviewers(mrCount);
	} catch(e) {
		console.log('Error occurred while fetching mrs', e);
	}
}

const verifyKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const headers = req.headers;
	const token = headers['x-gitlab-token'];

	if (token != SECRET_TOKEN) {
		return next(new Error('Invalid signature'));
	}

	next();
};

initState();

app.use(bodyParser.json());
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).send({
		code: 'InternalServerError',
		message: err.message,
	});
})

app.post('/mr-webhook', verifyKey, async (req, res) => {
	const {
		user: {id: authorId},
		project: { id: projectId},
		object_attributes: {iid: mrId},
	} = req.body as MREvent;
	const reviewer = assigner.getReviewer(authorId);

	if (!reviewer) {
		console.log('Could not find suitable reviewer');
		return res.send({success: true});
	}

	try {
		console.log('Assigning reviewer', reviewer);
		await mrApi.assignMergeRequest(projectId, mrId, reviewer.id);
		assigner.increaseLoadById(reviewer.id);
	} catch (e) {
		console.log(e);
	}

  res.send({success: true});
})

app.get('/ping', verifyKey, async (req, res) => {
	res.send({data: 'pong'});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
