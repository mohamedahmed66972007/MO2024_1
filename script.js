// تعريف الأسئلة من الملف
const questions = [
    { question: "اختر المعدن الأكثر استقراراً في الصخور النارية تحت الظروف السطحية:", options: ["البيتونايت", "الألبيت", "الأوليفين", "الكوارتز"], answer: "الكوارتز", type: "choice" },
    { question: "الصخر الذي يحتوي على نسبة عالية من السيليكا:", options: ["البريدوتيت", "الأنديزيتية", "الجرانيتية", "الفلسية"], answer: "الفلسية", type: "choice" },
    { question: "الصخور البركانية تتكون عند تصلب:", options: ["الحمم البركانية", "الصهارة", "التربة", "البخار"], answer: "الحمم البركانية", type: "choice" },
    { question: "ما هو المكون الأساسي في طبقة الوشاح العلوي؟", options: ["البريدوتيت", "الجرانيت", "البازلت", "الجابرو"], answer: "البريدوتيت", type: "choice" },
    { question: "نسيج الصخور الناتج عن تبريد الصهارة على سطح الأرض يسمى:", answer: "النسيج الزجاجي", type: "text" },
    { question: "الصخور النارية الفلسية تتكون من معادن غنية بـ:", options: ["الكالسيوم", "الحديد", "السيليكا", "الصوديوم"], answer: "السيليكا", type: "choice" },
    { question: "ما هي الصخور المافية؟", answer: "الصخور التي تحتوي على نسبة عالية من الحديد والمغنيسيوم", type: "text" },
];

let startTime;

// تشغيل دالة تحميل الأسئلة عند تحميل الصفحة
window.onload = function() {
    startTime = new Date();
    loadQuestions();
};

// دالة لتحميل الأسئلة وعرضها
function loadQuestions() {
    const container = document.getElementById('questions-container');
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');

        const questionText = document.createElement('p');
        questionText.innerText = `${index + 1}. ${q.question}`;
        questionText.style.color = 'black'; // لون السؤال أسود في عرض الأسئلة
        questionDiv.appendChild(questionText);

        if (q.type === 'choice') {
            q.options.forEach(option => {
                const optionDiv = document.createElement('label');
                optionDiv.classList.add('option-container');

                const optionInput = document.createElement('input');
                optionInput.type = 'radio';
                optionInput.name = `question${index}`;
                optionInput.value = option;

                const optionLabel = document.createElement('span');
                optionLabel.innerText = option;

                optionDiv.appendChild(optionInput);
                optionDiv.appendChild(optionLabel);
                questionDiv.appendChild(optionDiv);
            });
        } else {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.name = `question${index}`;
            questionDiv.appendChild(textInput);
        }

        container.appendChild(questionDiv);
    });
}



async function submitQuiz() {
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000; 
    let score = 0;
    let incorrectAnswers = [];
    let unansweredQuestions = [];

    for (const [index, q] of questions.entries()) {
        const userAnswer = document.querySelector(`[name="question${index}"]:checked`)?.value 
                        || document.querySelector(`[name="question${index}"]`).value;

        console.log(`معالجة السؤال ${index + 1}: ${q.question}`);
        console.log(`إجابة المستخدم: ${userAnswer}`);

        if (userAnswer) { // التأكد من أن المستخدم قد أدخل إجابة
            if (q.type === 'choice') {
                if (userAnswer === q.answer) {
                    score++;
                    console.log(`إجابة صحيحة!`);
                } else {
                    incorrectAnswers.push({ question: q.question, userAnswer: userAnswer, correct: q.answer });
                    console.log(`إجابة خاطئة! الإجابة الصحيحة هي: ${q.answer}`);
                }
            } else {
                // إذا كانت الإجابة نصية، تحقق من الإجابة باستخدام API
                const isCorrect = await checkTextAnswer(userAnswer, q.answer);
                if (isCorrect) {
                    score++;
                    console.log(`إجابة صحيحة للنص!`);
                } else {
                    incorrectAnswers.push({ question: q.question, userAnswer: userAnswer, correct: q.answer });
                    console.log(`إجابة خاطئة للنص! الإجابة الصحيحة هي: ${q.answer}`);
                }
            }
        } else {
            // إذا لم يتم حل السؤال، أضفه إلى قائمة الأسئلة غير المحلولة
            unansweredQuestions.push(q.question);
            console.log(`السؤال ${q.question} لم يتم حله.`);
        }
    }

    // عرض النتيجة بعد معالجة جميع الأسئلة
    displayResult(score, incorrectAnswers, unansweredQuestions, timeTaken);
}

async function checkTextAnswer(userAnswer, correctAnswer) {
    // تأكد من أن لديك API Key صحيح
    const apiKey = 'sk-svcacct-gF7KP1mwXUI_-aiKw9-pHCjVQEnjF0lcyjVP-9nMDMzz6NNi7vHy7w2a3OGS03edQ3WT3BlbkFJXD7NUm3HZk8kO1RMo1m3rrUnALxbnwYhR24_klsKkuc0R4qO2l12JOuRA0e0dpo6nAA'; // استبدل بـ API Key الخاص بك
    const url = 'https://api.openai.com/v1/engines/davinci/completionskey';

    const prompt = `هل الجملة التالية "${userAnswer}" تحمل نفس معنى هذه الجملة "${correctAnswer}"؟ أجب بـ "نعم" أو "لا".`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 5,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    });

    const data = await response.json();
    console.log(`الرد من API: ${data.choices[0].text.trim()}`);
    return data.choices[0].text.trim().toLowerCase() === "نعم";
}

// دالة لعرض النتيجة
function displayResult(score, incorrectAnswers, unansweredQuestions, timeTaken) {
    const resultDiv = document.getElementById('result');
    const minutes = Math.floor(timeTaken / 60);
    const seconds = Math.floor(timeTaken % 60);
    const formattedTime = minutes > 0 ? `${minutes} دقيقة و ${seconds} ثانية` : `${seconds} ثانية`;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <p>نتيجتك: ${score} من ${questions.length}</p>
        <p>الوقت المستغرق: ${formattedTime}</p>
        <h3>الأخطاء:</h3>
    `;

    if (incorrectAnswers.length === 0 && unansweredQuestions.length === 0) {
        resultDiv.innerHTML += `<p>لا يوجد أخطاء.</p>`;
    } else {
        incorrectAnswers.forEach(ia => {
            resultDiv.innerHTML += `
                <div class="result-error" style="margin-bottom: 10px;">
                    <p class="result-question" style="color: red;">السؤال: ${ia.question}</p>
                    <p>إجابتك: ${ia.userAnswer}</p>
                    <p>الإجابة الصحيحة: ${ia.correct}</p>
                </div>
            `;
        });

        unansweredQuestions.forEach(question => {
            resultDiv.innerHTML += `
                <div class="result-error" style="margin-bottom: 10px;">
                    <p class="result-question" style="color: red;">السؤال: ${question}</p>
                    <p>لم يتم حله.</p>
                </div>
            `;
        });
    }
}

// دالة للتحقق من الإجابات النصية باستخدام API
