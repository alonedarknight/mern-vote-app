const db = require('../models');


exports.showPolls = async (req, res, next) => {
    try {
        const polls = await db.Poll.find();

        res.status(200).json(polls);

    } catch (err) {
        err.status = 400;
        next(err);
    }
};

exports.usersPolls = async (req, res, next) => {
    try {
        const { id } = req.decoded;

        const user = await db.User.findById(id).populate('polls');

        res.status(200).json(user.polls);
    } catch (err) {
        err.status = 400;
        next(err);
    }
}




exports.createPoll = async (req, res, next) => {
    try {
        const { id } = req.decoded;
        const user = await db.User.findById(id);

        const { question, options } = req.body;

        const poll = await db.Poll.create({
            question,
            user,
            options: options.map(option => ({
                option,
                votes: 0

            }))
        });

        user.polls.push(poll._id);
        await user.save();

        res.status(201).json({ ...poll._doc, user: user._id });
    } catch (err) {
        err.status = 400;
        next(err);
    }
};

exports.getPoll = async (req, res, next) => {
    try {
        const { id } = req.params;

        const poll = await db.Poll.findById(id).populate('user', ['username', 'id']);

        if (!poll) throw new Error('No poll found');

        res.status(200).json(poll);
    } catch (err) {
        err.status = 400;
        next(err);
    }
}

exports.deletePoll = async (req, res, next) => {
    try {
        const { id: pollId } = req.params;
        const { id: userId } = req.decoded;

        const poll = await db.Poll.findById(pollId);

        if (!poll) throw new Error('No poll found');

        if (poll.user.toString() !== userId) {
            throw new Error('Unauthorized access');
        }

        await poll.deleteOne();

        res.status(202).json(poll);
    } catch (err) {
        err.status = 400;
        next(err);
    }
};

exports.updatePoll = async (req, res, next) => {
    try {
        const { id: pollId } = req.params;
        const { id: userId } = req.decoded;

        const poll = await db.Poll.findById(pollId);

        if (!poll) throw new Error('No poll found');

        if (poll.user.toString() !== userId) {
            throw new Error('Unauthorized access');
        }

        const { question, options } = req.body;

        if (question) poll.question = question;

        if (options && options.length >= 2) {
            poll.options = options.map(opt => ({
                option: opt,
                votes: 0
            }));
            poll.voted = [];
        }

        await poll.save();

        res.status(200).json(poll);
    } catch (err) {
        err.status = 400;
        next(err);
    }
};

exports.vote = async (req, res, next) => {
    try {
        const { id: pollId } = req.params;
        const { id: userId } = req.decoded;
        const { answer } = req.body;

        if (!answer) throw new Error('No answer provided');

        const poll = await db.Poll.findById(pollId);
        if (!poll) throw new Error('No poll found');

        const targetOption = poll.options.find(o => o.option === answer);
        if (!targetOption) throw new Error('Invalid option');

        const existingVote = poll.voted.find(v => v.user.toString() === userId);

        if (existingVote) {
            if (existingVote.answer === answer) {
                throw new Error('Already voted for this option');
            }
            // Decrement old option
            const oldOption = poll.options.find(o => o.option === existingVote.answer);
            if (oldOption) oldOption.votes = Math.max(0, oldOption.votes - 1);
            // Increment new option
            targetOption.votes += 1;
            existingVote.answer = answer;
        } else {
            targetOption.votes += 1;
            poll.voted.push({ user: userId, answer });
        }

        await poll.save();
        res.status(202).json(poll);
    } catch (err) {
        err.status = 400;
        next(err);
    }
};

exports.unvote = async (req, res, next) => {
    try {
        const { id: pollId } = req.params;
        const { id: userId } = req.decoded;

        const poll = await db.Poll.findById(pollId);
        if (!poll) throw new Error('No poll found');

        const existingVoteIndex = poll.voted.findIndex(v => v.user.toString() === userId);
        if (existingVoteIndex === -1) throw new Error('You have not voted');

        const existingVote = poll.voted[existingVoteIndex];
        const option = poll.options.find(o => o.option === existingVote.answer);
        if (option) option.votes = Math.max(0, option.votes - 1);

        poll.voted.splice(existingVoteIndex, 1);

        await poll.save();
        res.status(202).json(poll);
    } catch (err) {
        err.status = 400;
        next(err);
    }
};