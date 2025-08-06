const mongoose=require('mongoose');

const AnalysisSessionSchema=new mongoose.Schema({
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
   },
   fileId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedFile',
    required: true,

   },
   sheetName:{
    type: String,
    required: true,
   },
   xAxis:{
    type: String,
    required: true,
   },
   yAxis:{
    type: String,
    required:true,
   },
   chartType:{
    type: String,
    enum:['Bar','Line','Pie','3DColumn'],
    required: true,

   },
   aiSummarySnippet:{
    type: String,
    maxlength:500,
    default: null,
    
   },

},{
  timestamps: true,
}
);

module.exports=mongoose.model('AnalysisSession',AnalysisSessionSchema);
