require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const sampleQuestions = [
    // SECTION A: Reading Comprehension - Passage 1 (Questions 1-10)
    {
        section: 'RC',
        passageId: null,
        passageText: `The doctrine of separation of powers is a fundamental principle in constitutional law that divides governmental authority among three distinct branches: the legislature, the executive, and the judiciary. This division aims to prevent the concentration of power in any single entity and provides a system of checks and balances. The legislature makes laws, the executive implements them, and the judiciary interprets them. However, in practice, these functions often overlap, leading to what scholars call "collaborative governance." The Indian Constitution, while not explicitly mentioning separation of powers, embodies this principle through its structural design. The Supreme Court has repeatedly affirmed that separation of powers is part of the basic structure of the Constitution, which cannot be altered even by constitutional amendment.`,
        questionNumber: 1,
        questionText: 'According to the passage, what is the primary purpose of the separation of powers?',
        options: [
            'To create three equal branches of government',
            'To prevent concentration of power in one entity',
            'To establish collaborative governance',
            'To enable constitutional amendments'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 2,
        questionText: 'The passage suggests that in the Indian Constitution, separation of powers is:',
        options: [
            'Explicitly mentioned in Article 1',
            'Not mentioned at all',
            'Embodied through structural design',
            'Limited to the judiciary only'
        ],
        correctOption: 'C',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 3,
        questionText: 'What does the term "collaborative governance" refer to in the context of the passage?',
        options: [
            'Complete independence of all branches',
            'Overlapping functions of governmental branches',
            'Joint sessions of parliament',
            'International cooperation'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 4,
        questionText: 'According to the passage, which branch interprets laws?',
        options: [
            'Legislature',
            'Executive',
            'Judiciary',
            'All three branches'
        ],
        correctOption: 'C',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 5,
        questionText: 'The Supreme Court has affirmed that separation of powers is part of:',
        options: [
            'Directive Principles',
            'Fundamental Rights',
            'Basic structure of the Constitution',
            'Emergency provisions'
        ],
        correctOption: 'C',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 6,
        questionText: 'Which of the following best describes the relationship between the three branches as per the passage?',
        options: [
            'Completely independent',
            'Hierarchical',
            'Checks and balances',
            'Subordinate to each other'
        ],
        correctOption: 'C',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 7,
        questionText: 'The passage implies that the basic structure doctrine:',
        options: [
            'Can be amended easily',
            'Cannot be altered even by constitutional amendment',
            'Applies only to fundamental rights',
            'Was created by the legislature'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 8,
        questionText: 'What is the role of the executive branch?',
        options: [
            'Making laws',
            'Interpreting laws',
            'Implementing laws',
            'Amending the Constitution'
        ],
        correctOption: 'C',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 9,
        questionText: 'The passage suggests that separation of powers in practice:',
        options: [
            'Is absolute and rigid',
            'Often involves overlapping functions',
            'Exists only in theory',
            'Is unique to India'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 10,
        questionText: 'Which branch is responsible for making laws?',
        options: [
            'Judiciary',
            'Executive',
            'Legislature',
            'Constitutional bodies'
        ],
        correctOption: 'C',
        marks: 1
    },

    // SECTION A: Reading Comprehension - Passage 2 (Questions 11-20)
    {
        section: 'RC',
        passageId: null,
        passageText: `The concept of natural justice is rooted in the principle that no person should be condemned unheard. It encompasses two fundamental rules: audi alteram partem (hear the other side) and nemo judex in causa sua (no one should be a judge in their own cause). These principles ensure fairness in administrative and judicial proceedings. The first principle requires that parties be given adequate notice and opportunity to present their case. The second principle mandates that decision-makers must be impartial and free from bias. While these rules are not absolute and may be subject to exceptions in cases of urgency or national security, courts have consistently held that any deviation must be justified and proportionate. The application of natural justice extends beyond courts to administrative tribunals, disciplinary proceedings, and even private bodies exercising public functions.`,
        questionNumber: 11,
        questionText: 'What does "audi alteram partem" mean?',
        options: [
            'No one should be a judge in their own cause',
            'Hear the other side',
            'Justice delayed is justice denied',
            'Equal protection of law'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 12,
        questionText: 'According to the passage, natural justice requires decision-makers to be:',
        options: [
            'Experienced and qualified',
            'Elected representatives',
            'Impartial and free from bias',
            'Appointed by the government'
        ],
        correctOption: 'C',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 13,
        questionText: 'The principle "nemo judex in causa sua" means:',
        options: [
            'Everyone has the right to be heard',
            'No one should be a judge in their own cause',
            'Justice must be done publicly',
            'Laws must be applied equally'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 14,
        questionText: 'Natural justice applies to:',
        options: [
            'Only courts of law',
            'Only administrative tribunals',
            'Courts, tribunals, and even private bodies exercising public functions',
            'Only criminal proceedings'
        ],
        correctOption: 'C',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 15,
        questionText: 'The passage suggests that exceptions to natural justice:',
        options: [
            'Are never permitted',
            'Must be justified and proportionate',
            'Apply in all administrative matters',
            'Are decided by the legislature'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 16,
        questionText: 'What is the fundamental principle underlying natural justice?',
        options: [
            'Speed of justice',
            'No person should be condemned unheard',
            'Majority rule',
            'Strict adherence to procedure'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 17,
        questionText: 'The first principle of natural justice requires:',
        options: [
            'Immediate decisions',
            'Written submissions only',
            'Adequate notice and opportunity to present case',
            'Legal representation in all cases'
        ],
        correctOption: 'C',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 18,
        questionText: 'When might deviations from natural justice be permitted?',
        options: [
            'Never',
            'In cases of urgency or national security',
            'Whenever convenient',
            'Only in civil matters'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 19,
        questionText: 'The passage indicates that natural justice principles are:',
        options: [
            'Absolute with no exceptions',
            'Subject to exceptions that must be justified',
            'Optional in administrative proceedings',
            'Applicable only in higher courts'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'RC',
        passageId: null,
        passageText: null,
        questionNumber: 20,
        questionText: 'Natural justice ensures fairness in:',
        options: [
            'Only judicial proceedings',
            'Only administrative proceedings',
            'Both administrative and judicial proceedings',
            'Only criminal trials'
        ],
        correctOption: 'C',
        marks: 1
    },

    // SECTION B: Legal Reasoning (Questions 21-30)
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 21,
        questionText: 'Principle: A contract entered into under coercion is voidable at the option of the aggrieved party. Facts: A threatens to harm B\'s family unless B sells his property to A at half its market value. B agrees and signs the contract. Can B avoid the contract?',
        options: [
            'No, because B signed voluntarily',
            'Yes, because the contract was entered under coercion',
            'No, because the contract is valid',
            'Yes, but only if B can prove actual harm'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 22,
        questionText: 'Principle: A person is liable for negligence if they owe a duty of care, breach that duty, and cause damage. Facts: A doctor fails to diagnose a patient\'s condition, but the patient recovers naturally. Is the doctor liable?',
        options: [
            'Yes, because duty was breached',
            'No, because no damage was caused',
            'Yes, because doctors always owe duty of care',
            'No, because the patient recovered'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 23,
        questionText: 'Principle: Possession is nine-tenths of the law. Facts: A has been living in a house for 20 years without any legal title. B claims to be the legal owner with proper documents. Who has a better claim?',
        options: [
            'A, because of long possession',
            'B, because of legal title',
            'Both have equal claims',
            'Neither has a valid claim'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 24,
        questionText: 'Principle: Ignorance of law is no excuse. Facts: A foreign tourist violates a local traffic rule, claiming they were unaware of it. Is this a valid defense?',
        options: [
            'Yes, because they are a tourist',
            'No, because ignorance of law is no excuse',
            'Yes, if the rule was not published in their language',
            'No, but penalty may be reduced'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 25,
        questionText: 'Principle: A minor\'s agreement is void. Facts: A 16-year-old enters into a contract to purchase a car. Is the contract valid?',
        options: [
            'Yes, if the minor can pay',
            'No, because minor\'s agreements are void',
            'Yes, if parents consent',
            'No, unless it\'s for necessities'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 26,
        questionText: 'Principle: Self-defense is a valid defense if force used is proportionate to threat. Facts: A slaps B. B shoots A in response. Is B\'s action justified?',
        options: [
            'Yes, because it was self-defense',
            'No, because force was disproportionate',
            'Yes, if B felt threatened',
            'No, unless B had no other option'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 27,
        questionText: 'Principle: Agreements in restraint of trade are void. Facts: A sells his business to B with a condition that A will not start a similar business anywhere in the country for 10 years. Is this condition valid?',
        options: [
            'Yes, because it protects B\'s business',
            'No, because it\'s in restraint of trade',
            'Yes, if both parties agreed',
            'No, unless limited to a specific area'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 28,
        questionText: 'Principle: Res ipsa loquitur - the thing speaks for itself. Facts: A barrel falls from B\'s warehouse and injures A. B claims no negligence. Can A succeed?',
        options: [
            'No, because B denies negligence',
            'Yes, because the incident itself suggests negligence',
            'No, unless A proves B\'s fault',
            'Yes, but only if there are witnesses'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 29,
        questionText: 'Principle: Volenti non fit injuria - no injury to one who consents. Facts: A participates in a boxing match and gets injured. Can A sue the opponent?',
        options: [
            'Yes, because A was injured',
            'No, because A consented to the risk',
            'Yes, if injury was severe',
            'No, unless rules were violated'
        ],
        correctOption: 'B',
        marks: 1
    },
    {
        section: 'LEGAL',
        passageId: null,
        passageText: null,
        questionNumber: 30,
        questionText: 'Principle: Caveat emptor - buyer beware. Facts: A buys a second-hand car without inspection. Later discovers defects. Can A claim refund?',
        options: [
            'Yes, because car was defective',
            'No, because buyer should have inspected',
            'Yes, if seller knew about defects',
            'No, unless seller gave warranty'
        ],
        correctOption: 'B',
        marks: 1
    }
];

const seedQuestions = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing questions
        await Question.deleteMany({});
        console.log('🗑️  Cleared existing questions');

        // Insert sample questions
        const inserted = await Question.insertMany(sampleQuestions);
        console.log(`✅ Inserted ${inserted.length} questions`);

        // Verify counts
        const rcCount = await Question.countDocuments({ section: 'RC' });
        const legalCount = await Question.countDocuments({ section: 'LEGAL' });

        console.log(`\n📊 Question Summary:`);
        console.log(`   Reading Comprehension: ${rcCount}`);
        console.log(`   Legal Reasoning: ${legalCount}`);
        console.log(`   Total: ${rcCount + legalCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding questions:', error);
        process.exit(1);
    }
};

seedQuestions();
