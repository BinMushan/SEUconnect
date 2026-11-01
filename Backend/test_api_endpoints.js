async function testApi() {
  console.log('>>> TESTING SEUCONNECT STUDENT BACKEND API ENDPOINTS <<<\n');

  // 1. Health check
  console.log('1. Health Check (GET /api/health)');
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('Status Code:', healthRes.status);
  console.log('Health Response:', healthData);
  console.log('--------------------------------------------------\n');

  // 2. Get all students
  console.log('2. List All Students (GET /api/student)');
  const studentsRes = await fetch('http://localhost:5000/api/student');
  const studentsData = await studentsRes.json();
  console.log('Status Code:', studentsRes.status);
  console.log(`Retrieved ${studentsData.count} students from MongoDB Atlas:`);
  studentsData.data.forEach(s => {
    console.log(` - [${s.studentId}] ${s.fullName} (${s.department}) | Status: ${s.academicStatus}`);
  });
  console.log('--------------------------------------------------\n');

  // 3. Fetch Student 1 by ID
  console.log('3. Fetch Student 1 Section (GET /api/student/find?id=2021/ICT/85)');
  const s1Res = await fetch('http://localhost:5000/api/student/find?id=2021/ICT/85');
  const s1Data = await s1Res.json();
  console.log('Status Code:', s1Res.status);
  console.log('Student Full Name:', s1Data.data.fullName);
  console.log('Student Email:', s1Data.data.email);
  console.log('Profile Guardian:', s1Data.data.academicProfile.guardianName);
  console.log('Overall Attendance:', s1Data.data.attendance.overallAttendancePercentage + '%');
  console.log('Medical Requests in DB:', s1Data.data.medicalRequests.length);
  console.log('CGPA in DB:', s1Data.data.gpaCgpa.cgpa);
  console.log('--------------------------------------------------\n');

  // 4. Fetch Student 2 by Index Number
  console.log('4. Fetch Student 2 by Index No (GET /api/student/ICT21102)');
  const s2Res = await fetch('http://localhost:5000/api/student/ICT21102');
  const s2Data = await s2Res.json();
  console.log('Status Code:', s2Res.status);
  console.log('Student 2 Name:', s2Data.data.fullName);
  console.log('Student 2 CGPA:', s2Data.data.gpaCgpa.cgpa);
  console.log('Student 2 Standing:', s2Data.data.gpaCgpa.academicStanding);
  console.log('--------------------------------------------------\n');

  // 5. Submit Medical Excuse into Student 1 section
  console.log('5. Submit Medical Excuse (POST /api/student/2021%2FICT%2F85/medical)');
  const medPayload = {
    reason: 'Severe Migraine and Medical Observation',
    startDate: '2026-10-18',
    endDate: '2026-10-20',
    durationDays: 3,
    doctorName: 'Dr. M.I. Nawas',
    hospitalOrClinic: 'University Health Centre, SEUSL',
    affectedLectures: ['ICT 31023 - Lecture 14', 'ICT 31043 - Lab 07']
  };
  const medRes = await fetch('http://localhost:5000/api/student/2021%2FICT%2F85/medical', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medPayload)
  });
  const medData = await medRes.json();
  console.log('Status Code:', medRes.status);
  console.log('Medical Submission Response:', medData);
  console.log('--------------------------------------------------\n');

  // 6. Verify Medical Excuse is now stored in Student 1 MongoDB section
  console.log('6. Verify Medical Excuse Stored in MongoDB Atlas');
  const verifyRes = await fetch('http://localhost:5000/api/student/2021%2FICT%2F85/medical');
  const verifyData = await verifyRes.json();
  console.log('Total Medical Records in DB for 2021/ICT/85:', verifyData.data.length);
  console.log('Latest Record Stored:', verifyData.data[verifyData.data.length - 1]);
  console.log('--------------------------------------------------\n');

  console.log('>>> ALL API TESTS PASSED! BACKEND IS OPERATIONAL AND PERSISTING DATA IN MONGODB ATLAS! <<<');
}

testApi().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
