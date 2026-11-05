// Builds every declared index (unique constraints included) for all registered models.
module.exports = {
  id: '001_create_indexes',
  description: 'Create indexes and unique constraints for all models',
  async up(db, mongoose) {
    for (const model of Object.values(mongoose.models)) {
      if (model.modelName === 'Migration') continue;
      await model.createIndexes();
    }
  },
};
