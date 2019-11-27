const { Schema, model } = require('mongoose');

const QuestionSchema = new Schema({
  label: String,
  responses: [
    {
      label: String,
      points: Number,
    },
  ],
  tags: [],
  userId: Schema.Types.ObjectId,
});

QuestionSchema.statics.getAll = async function getAll(userId) {
  return this.find({
    userId,
  });
};

QuestionSchema.statics.getRandom = async function getRandom() {
  const count = await this.countDocuments();
  const rand = Math.floor(Math.random() * count);
  return this.findOne().skip(rand);
};


const Question = model('Question', QuestionSchema);

module.exports = Question;
