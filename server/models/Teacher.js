const mongoose = require('mongoose')

// 1. Darabase connection
mongoose.connect('mongodb://localhost:27017/timetable_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// 2. Schema and model
const scheduleSchema = new mongoose.Schema({}, { strict: false })

const individualTimetableSchema = new mongoose.Schema({
  teacher_id: mongoose.Schema.Types.ObjectId,
  teacher_name: String,
  schedule: scheduleSchema,
})

const IndividualTimetable = mongoose.model('IndividualTimetable', individualTimetableSchema)

// Delete a specific timeblock
async function deleteTimeBlock(teacherId, day, timeSlot) {
  try {
    const result = await IndividualTimetable.updateOne(
      { teacher_id: new mongoose.Types.ObjectId(teacherId) },
      {
        $pull: {
          [`schedule.${day}`]: { time_slot: timeSlot },
        },
      },
    )

    console.log('Result:', result)
  } catch (error) {
    console.error('Error deleting block:', error)
  } finally {
    mongoose.connection.close() // close connection
  }
}

// Use example
deleteTimeBlock('685d939d2add81005a6306a6', 'Monday', '14:10 - 15:00')
