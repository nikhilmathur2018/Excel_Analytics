const OpenAI= require('openai');
const asyncHandler=require('express-async-handler');

const openai=new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Get AI summary of data
// @route   POST /api/ai/summary
// @access  Private

exports.getAiSummary = asyncHandler(async (req, res) => {
    const { dataToSummarize, chartType, xAxis, yAxis } = req.body; // Expect structured data and context

    if (!dataToSummarize || dataToSummarize.length === 0) {
        res.status(400);
        throw new Error('No data provided for AI summary.');
    }

    // Limit the data sent to AI for performance and token usage
    const limitedData = dataToSummarize.slice(0, 50); // Send first 50 rows as a sample

    let prompt = `Provide a concise summary and key insights from the following structured data. `;
    prompt += `Focus on trends, anomalies, or important metrics related to "${yAxis}" by "${xAxis}". `;
    prompt += `The user is looking at a ${chartType} chart of this data. Data: ${JSON.stringify(limitedData)}`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", 
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300, 
            temperature: 0.7, 
        });

        const aiSummary = completion.choices[0].message.content;


        res.json({ summary: aiSummary });

    } catch (error) {
        console.error('Error with AI API:', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: 'Error generating AI summary.',
            error: error.response ? error.response.data : error.message
        });
    }
});