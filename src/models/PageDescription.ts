import mongoose from 'mongoose';

const pageDescriptionSchema = new mongoose.Schema({
  pagePath: {
    type: String,
    required: [true, 'Page path is required'],
    unique: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
pageDescriptionSchema.index({ pagePath: 1 });
pageDescriptionSchema.index({ isActive: 1 });

const PageDescription = mongoose.models.PageDescription || mongoose.model('PageDescription', pageDescriptionSchema);

export default PageDescription;

