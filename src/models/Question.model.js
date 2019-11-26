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


const Question = model('Question', QuestionSchema);

module.exports = Question;
