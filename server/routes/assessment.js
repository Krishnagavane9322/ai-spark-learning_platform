const express = require("express");
const User = require("../models/User");
const Course = require("../models/Course");
const auth = require("../middleware/auth");

const router = express.Router();

// Learning path templates based on interests and skill levels
// resources: { name, url, type } — type: "docs"|"video"|"course"|"practice"|"book"
const pathDatabase = {
  "Web Development": [
    { title: "HTML & CSS Mastery", description: "Build responsive layouts with modern CSS Grid, Flexbox, and animations. Learn semantic HTML5, CSS variables, and responsive design patterns.", category: "Frontend", duration: "1 week", xp: 300, whatYouLearn: ["Semantic HTML5 structure", "CSS Grid & Flexbox", "Responsive design with media queries", "CSS animations & transitions", "CSS variables & custom properties"], resources: [{ name: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", type: "docs" }, { name: "CSS-Tricks", url: "https://css-tricks.com/guides/", type: "docs" }, { name: "freeCodeCamp HTML/CSS", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", type: "course" }, { name: "Flexbox Froggy", url: "https://flexboxfroggy.com", type: "practice" }, { name: "CSS Grid Garden", url: "https://cssgridgarden.com", type: "practice" }] },
    { title: "JavaScript Fundamentals", description: "Master core JavaScript: variables, closures, async/await, DOM manipulation, and ES6+ features. The foundation of all web development.", category: "Frontend", duration: "2 weeks", xp: 500, whatYouLearn: ["Variables, types & scope", "Functions & closures", "DOM manipulation", "Async/await & Promises", "ES6+ features (arrow fns, destructuring, modules)"], resources: [{ name: "JavaScript.info", url: "https://javascript.info", type: "docs" }, { name: "Eloquent JavaScript", url: "https://eloquentjavascript.net", type: "book" }, { name: "freeCodeCamp JS", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", type: "course" }, { name: "30 Days of JS", url: "https://github.com/Asabeneh/30-Days-Of-JavaScript", type: "course" }, { name: "JS Exercises", url: "https://exercism.org/tracks/javascript", type: "practice" }] },
    { title: "React Core Concepts", description: "Build dynamic UIs with React: components, hooks, state management, and the component lifecycle. Learn JSX and React's mental model.", category: "Frontend", duration: "2 weeks", xp: 600, whatYouLearn: ["JSX & components", "useState & useEffect hooks", "Props & state", "Context API", "React Router"], resources: [{ name: "React Official Docs", url: "https://react.dev/learn", type: "docs" }, { name: "Scrimba React Course", url: "https://scrimba.com/learn/learnreact", type: "course" }, { name: "Full Stack Open", url: "https://fullstackopen.com/en/part1", type: "course" }, { name: "React Tutorial (official)", url: "https://react.dev/learn/tutorial-tic-tac-toe", type: "docs" }, { name: "Build React Apps", url: "https://www.freecodecamp.org/learn/front-end-development-libraries/#react", type: "practice" }] },
    { title: "Backend with Node.js", description: "Build REST APIs with Express.js, handle middleware, routing, error handling, and connect to databases. Master server-side JavaScript.", category: "Backend", duration: "2 weeks", xp: 600, whatYouLearn: ["Node.js event loop", "Express routing & middleware", "REST API design", "Error handling", "Authentication with JWT"], resources: [{ name: "Node.js Official Docs", url: "https://nodejs.org/en/docs/", type: "docs" }, { name: "Express Guide", url: "https://expressjs.com/en/guide/routing.html", type: "docs" }, { name: "The Odin Project Node", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs", type: "course" }, { name: "REST API Tutorial", url: "https://restfulapi.net", type: "docs" }, { name: "Postman Learning", url: "https://learning.postman.com", type: "practice" }] },
    { title: "Database Design", description: "Learn both SQL and NoSQL databases. Design schemas, write complex queries, and understand relationships, indexing, and data modeling.", category: "Backend", duration: "1.5 weeks", xp: 500, whatYouLearn: ["MongoDB schemas & CRUD", "SQL queries & joins", "Database relationships", "Indexing & optimization", "Mongoose ORM"], resources: [{ name: "MongoDB University", url: "https://university.mongodb.com", type: "course" }, { name: "SQLBolt", url: "https://sqlbolt.com", type: "practice" }, { name: "Prisma Docs", url: "https://www.prisma.io/docs", type: "docs" }, { name: "SQL Murder Mystery", url: "https://mystery.knightlab.com", type: "practice" }, { name: "Database Design Course", url: "https://www.freecodecamp.org/learn/relational-database/", type: "course" }] },
    { title: "Authentication & Security", description: "Implement secure authentication using JWT, OAuth 2.0, bcrypt, and session management. Understand CORS, CSRF, and web security best practices.", category: "Security", duration: "1 week", xp: 400, whatYouLearn: ["JWT creation & validation", "Password hashing with bcrypt", "OAuth 2.0 flow", "CORS configuration", "OWASP Top 10 vulnerabilities"], resources: [{ name: "Auth0 Docs", url: "https://auth0.com/docs", type: "docs" }, { name: "JWT.io Guide", url: "https://jwt.io/introduction", type: "docs" }, { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "docs" }, { name: "Passport.js", url: "https://www.passportjs.org/docs/", type: "docs" }, { name: "Web Security Academy", url: "https://portswigger.net/web-security", type: "practice" }] },
    { title: "Full-Stack Project", description: "Build and deploy a complete production-grade full-stack application with auth, database, API, and a polished frontend.", category: "Project", duration: "3 weeks", xp: 1500, whatYouLearn: ["Full project architecture", "Production deployment", "CI/CD basics", "Performance optimization", "Portfolio presentation"], resources: [{ name: "Vercel Deployment", url: "https://vercel.com/docs", type: "docs" }, { name: "Railway (Backend hosting)", url: "https://docs.railway.app", type: "docs" }, { name: "GitHub Actions CI/CD", url: "https://docs.github.com/en/actions", type: "docs" }, { name: "Project Ideas", url: "https://github.com/practical-tutorials/project-based-learning", type: "practice" }, { name: "Render.com", url: "https://render.com/docs", type: "docs" }] },
  ],
  "AI & Machine Learning": [
    { title: "Python for Data Science", description: "Master Python's data science stack: NumPy for numerical computing, Pandas for data manipulation, and Matplotlib for visualization.", category: "Foundations", duration: "2 weeks", xp: 500, whatYouLearn: ["NumPy arrays & operations", "Pandas DataFrames", "Data cleaning & transformation", "Matplotlib & Seaborn charts", "Jupyter Notebooks"], resources: [{ name: "Kaggle Learn Python", url: "https://www.kaggle.com/learn/python", type: "course" }, { name: "NumPy Docs", url: "https://numpy.org/doc/stable/user/quickstart.html", type: "docs" }, { name: "Pandas Docs", url: "https://pandas.pydata.org/docs/getting_started/index.html", type: "docs" }, { name: "DataCamp Intro", url: "https://www.datacamp.com/courses/intro-to-python-for-data-science", type: "course" }, { name: "Real Python", url: "https://realpython.com/learning-paths/data-science-python/", type: "course" }] },
    { title: "Statistics & Probability", description: "Understand the math behind ML: probability distributions, hypothesis testing, Bayesian thinking, and statistical inference.", category: "Math", duration: "1.5 weeks", xp: 400, whatYouLearn: ["Probability distributions", "Hypothesis testing", "Bayesian inference", "Correlation & regression stats", "Central Limit Theorem"], resources: [{ name: "Khan Academy Statistics", url: "https://www.khanacademy.org/math/statistics-probability", type: "course" }, { name: "StatQuest YouTube", url: "https://www.youtube.com/@statquest", type: "video" }, { name: "Think Stats (free book)", url: "https://greenteapress.com/wp/think-stats-2e/", type: "book" }, { name: "Seeing Theory", url: "https://seeing-theory.brown.edu", type: "docs" }, { name: "Statistics with Python (Coursera)", url: "https://www.coursera.org/specializations/statistics-with-python", type: "course" }] },
    { title: "Machine Learning Basics", description: "Learn supervised and unsupervised learning: regression, classification, clustering, decision trees, and model evaluation metrics.", category: "ML", duration: "2 weeks", xp: 600, whatYouLearn: ["Linear & logistic regression", "Decision trees & random forests", "K-Means clustering", "Model evaluation (accuracy, F1, AUC)", "Train/test split & cross-validation"], resources: [{ name: "Scikit-learn Docs", url: "https://scikit-learn.org/stable/getting_started.html", type: "docs" }, { name: "Andrew Ng ML Course", url: "https://www.coursera.org/specializations/machine-learning-introduction", type: "course" }, { name: "ML Crash Course (Google)", url: "https://developers.google.com/machine-learning/crash-course", type: "course" }, { name: "Kaggle ML Course", url: "https://www.kaggle.com/learn/intro-to-machine-learning", type: "course" }, { name: "Hands-On ML Book", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/", type: "book" }] },
    { title: "Deep Learning & Neural Networks", description: "Build neural networks from scratch and with frameworks. Understand CNNs for images, RNNs for sequences, and backpropagation.", category: "ML", duration: "3 weeks", xp: 800, whatYouLearn: ["Perceptrons & activation functions", "CNNs for image recognition", "RNNs & LSTMs", "Backpropagation", "Transfer learning"], resources: [{ name: "TensorFlow Tutorials", url: "https://www.tensorflow.org/tutorials", type: "docs" }, { name: "fast.ai Practical DL", url: "https://course.fast.ai", type: "course" }, { name: "3Blue1Brown Neural Networks", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", type: "video" }, { name: "Deep Learning Specialization", url: "https://www.coursera.org/specializations/deep-learning", type: "course" }, { name: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/", type: "docs" }] },
    { title: "Natural Language Processing", description: "Process and understand text with NLP: tokenization, embeddings, transformers (BERT, GPT), sentiment analysis, and text generation.", category: "NLP", duration: "2 weeks", xp: 700, whatYouLearn: ["Text tokenization & cleaning", "Word embeddings (Word2Vec)", "Transformer architecture", "Fine-tuning BERT/GPT", "Sentiment analysis & NER"], resources: [{ name: "Hugging Face Course", url: "https://huggingface.co/learn/nlp-course", type: "course" }, { name: "spaCy Docs", url: "https://spacy.io/usage", type: "docs" }, { name: "NLP with Python (NLTK Book)", url: "https://www.nltk.org/book/", type: "book" }, { name: "Stanford CS224N", url: "https://web.stanford.edu/class/cs224n/", type: "course" }, { name: "Kaggle NLP", url: "https://www.kaggle.com/learn/natural-language-processing", type: "practice" }] },
    { title: "AI Project: End-to-End", description: "Build, train, evaluate, and deploy a complete ML model to production using cloud services and web APIs.", category: "Project", duration: "3 weeks", xp: 1500, whatYouLearn: ["End-to-end ML pipeline", "Model deployment with FastAPI", "Streamlit dashboards", "Cloud ML (AWS/GCP)", "Model monitoring"], resources: [{ name: "Kaggle Competitions", url: "https://www.kaggle.com/competitions", type: "practice" }, { name: "Streamlit Docs", url: "https://docs.streamlit.io", type: "docs" }, { name: "FastAPI ML Deployment", url: "https://fastapi.tiangolo.com", type: "docs" }, { name: "MLflow", url: "https://mlflow.org/docs/latest/index.html", type: "docs" }, { name: "AWS SageMaker", url: "https://docs.aws.amazon.com/sagemaker/", type: "docs" }] },
  ],
  "Mobile Development": [
    { title: "JavaScript/TypeScript Refresher", description: "Sharpen your JS skills and learn TypeScript: static typing, interfaces, generics, and modern async patterns for mobile.", category: "Foundations", duration: "1 week", xp: 300, whatYouLearn: ["TypeScript types & interfaces", "Generics & utility types", "Async/await patterns", "ES6+ features", "Type safety in React"], resources: [{ name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "docs" }, { name: "JavaScript.info", url: "https://javascript.info", type: "docs" }, { name: "Exercism TypeScript", url: "https://exercism.org/tracks/typescript", type: "practice" }, { name: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/", type: "book" }, { name: "TS with React", url: "https://react-typescript-cheatsheet.netlify.app", type: "docs" }] },
    { title: "React Native Fundamentals", description: "Build cross-platform iOS & Android apps with React Native. Learn core components, navigation, styling, and Expo workflow.", category: "Mobile", duration: "2 weeks", xp: 600, whatYouLearn: ["Core components (View, Text, Image)", "StyleSheet & Flexbox on mobile", "React Navigation", "Expo workflow", "Platform-specific code"], resources: [{ name: "React Native Docs", url: "https://reactnative.dev/docs/getting-started", type: "docs" }, { name: "Expo Docs", url: "https://docs.expo.dev", type: "docs" }, { name: "Notifee (notifications)", url: "https://notifee.app/react-native/docs/overview", type: "docs" }, { name: "React Navigation", url: "https://reactnavigation.org/docs/getting-started", type: "docs" }, { name: "William Candillon YouTube", url: "https://www.youtube.com/@wcandillon", type: "video" }] },
    { title: "State Management & APIs", description: "Manage global app state with Redux Toolkit or Zustand. Integrate REST and GraphQL APIs with efficient data fetching.", category: "Mobile", duration: "1.5 weeks", xp: 500, whatYouLearn: ["Redux Toolkit", "Zustand state management", "React Query / TanStack", "REST API integration", "GraphQL with Apollo"], resources: [{ name: "Redux Toolkit Docs", url: "https://redux-toolkit.js.org/introduction/getting-started", type: "docs" }, { name: "TanStack Query", url: "https://tanstack.com/query/latest/docs/framework/react/overview", type: "docs" }, { name: "Zustand", url: "https://docs.pmnd.rs/zustand/getting-started/introduction", type: "docs" }, { name: "Apollo Client", url: "https://www.apollographql.com/docs/react/", type: "docs" }, { name: "Axios Docs", url: "https://axios-http.com/docs/intro", type: "docs" }] },
    { title: "Native Features & Permissions", description: "Access device hardware: camera, GPS, push notifications, biometrics, and local storage. Handle permissions on iOS and Android.", category: "Mobile", duration: "1.5 weeks", xp: 500, whatYouLearn: ["Camera & media library", "GPS & location services", "Push notifications (FCM/APNs)", "AsyncStorage & SecureStore", "Biometric authentication"], resources: [{ name: "Expo APIs Reference", url: "https://docs.expo.dev/versions/latest/", type: "docs" }, { name: "Firebase FCM Docs", url: "https://firebase.google.com/docs/cloud-messaging", type: "docs" }, { name: "React Native Camera", url: "https://react-native-vision-camera.com/docs/guides", type: "docs" }, { name: "Expo Location", url: "https://docs.expo.dev/sdk/location/", type: "docs" }, { name: "Expo SecureStore", url: "https://docs.expo.dev/sdk/securestore/", type: "docs" }] },
    { title: "App Store Deployment", description: "Prepare, build, and publish your app to the App Store and Google Play. Manage app signing, versioning, and release process.", category: "DevOps", duration: "1 week", xp: 400, whatYouLearn: ["EAS Build setup", "iOS App Store submission", "Google Play deployment", "App signing & certificates", "OTA updates with Expo"], resources: [{ name: "EAS Build Guide", url: "https://docs.expo.dev/build/introduction/", type: "docs" }, { name: "Apple Developer Docs", url: "https://developer.apple.com/ios/submit/", type: "docs" }, { name: "Google Play Console", url: "https://support.google.com/googleplay/android-developer/", type: "docs" }, { name: "Expo Updates (OTA)", url: "https://docs.expo.dev/eas-update/introduction/", type: "docs" }, { name: "App Store Optimization", url: "https://www.apptamin.com/blog/app-store-optimization-guide/", type: "docs" }] },
    { title: "Mobile App Capstone", description: "Design, build, and launch a polished cross-platform app with a real use case, good UX, and production-quality code.", category: "Project", duration: "3 weeks", xp: 1500, whatYouLearn: ["Full app architecture", "Offline-first design", "Performance optimization", "App store listing creation", "User feedback & iteration"], resources: [{ name: "UI Inspiration (Dribbble)", url: "https://dribbble.com/tags/mobile-app", type: "docs" }, { name: "App Store Guidelines", url: "https://developer.apple.com/app-store/review/guidelines/", type: "docs" }, { name: "Material Design 3", url: "https://m3.material.io", type: "docs" }, { name: "React Native Performance", url: "https://reactnative.dev/docs/performance", type: "docs" }, { name: "Expo Go", url: "https://expo.dev/go", type: "practice" }] },
  ],
  "UI/UX Design": [
    { title: "Design Thinking & Research", description: "Apply human-centered design: user personas, empathy maps, journey maps, and competitive analysis to define real problems.", category: "Research", duration: "1 week", xp: 300, whatYouLearn: ["User research methods", "Creating personas", "Journey mapping", "Problem definition", "Competitive analysis"], resources: [{ name: "IDEO Design Kit", url: "https://www.designkit.org/methods", type: "docs" }, { name: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/", type: "docs" }, { name: "UX Collective", url: "https://uxdesign.cc", type: "docs" }, { name: "Interaction Design Foundation", url: "https://www.interaction-design.org/courses", type: "course" }, { name: "Google UX Design Certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design", type: "course" }] },
    { title: "Visual Design Principles", description: "Master typography, color theory, spacing, visual hierarchy, and layout grids — the fundamentals of great visual design.", category: "Design", duration: "1.5 weeks", xp: 400, whatYouLearn: ["Typography scale & pairing", "Color theory & palettes", "Spacing & layout grids", "Visual hierarchy", "Gestalt principles"], resources: [{ name: "Refactoring UI (book)", url: "https://www.refactoringui.com", type: "book" }, { name: "Material Design Guidelines", url: "https://m3.material.io/", type: "docs" }, { name: "Apple Human Interface Guidelines", url: "https://developer.apple.com/design/human-interface-guidelines/", type: "docs" }, { name: "Typescale", url: "https://typescale.com", type: "practice" }, { name: "Coolors (palette generator)", url: "https://coolors.co", type: "practice" }] },
    { title: "Figma Mastery", description: "Become proficient in Figma: components, auto-layout, variants, design tokens, prototyping, and handing off to developers.", category: "Tools", duration: "2 weeks", xp: 500, whatYouLearn: ["Figma components & variants", "Auto-layout & grids", "Interactive prototyping", "Design tokens", "Dev handoff with Inspect"], resources: [{ name: "Figma Learn", url: "https://help.figma.com/hc/en-us/categories/360002051613-Figma-design", type: "docs" }, { name: "Figma Community Files", url: "https://www.figma.com/community", type: "practice" }, { name: "Design+Code Figma", url: "https://designcode.io/figma-handbook", type: "course" }, { name: "YouTube: Figma Tutorials", url: "https://www.youtube.com/@UICollective", type: "video" }, { name: "Free Figma UI Kits", url: "https://www.figma.com/community/tag/ui%20kit", type: "practice" }] },
    { title: "Interaction Design", description: "Craft delightful micro-interactions and animations. Understanding motion design, gesture-based UX, and feedback patterns.", category: "Design", duration: "1.5 weeks", xp: 500, whatYouLearn: ["Micro-interaction principles", "Animation timing & easing", "Gesture-based design", "Transition design", "Prototyping animations in Figma"], resources: [{ name: "LottieFiles", url: "https://lottiefiles.com", type: "practice" }, { name: "Framer Motion Docs", url: "https://www.framer.com/motion/", type: "docs" }, { name: "UI Movement (inspiration)", url: "https://uimovement.com", type: "practice" }, { name: "Principle App", url: "https://principleformac.com", type: "docs" }, { name: "Prototyping in Figma", url: "https://help.figma.com/hc/en-us/categories/360002051613", type: "docs" }] },
    { title: "Usability Testing", description: "Run effective usability tests: A/B testing, heatmaps, user interviews, and accessibility audits to improve your designs.", category: "Research", duration: "1 week", xp: 400, whatYouLearn: ["Usability test planning", "A/B testing methods", "Heatmap analysis", "WCAG accessibility standards", "User interview techniques"], resources: [{ name: "Maze (usability testing)", url: "https://maze.co/guides/usability-testing/", type: "docs" }, { name: "WCAG Guidelines", url: "https://www.w3.org/WAI/standards-guidelines/wcag/", type: "docs" }, { name: "Hotjar", url: "https://www.hotjar.com/usability-testing/", type: "docs" }, { name: "UX Research Field Guide", url: "https://www.userinterviews.com/ux-research-field-guide", type: "docs" }, { name: "UsabilityHub", url: "https://usabilityhub.com", type: "practice" }] },
    { title: "Design Portfolio Project", description: "Create a full end-to-end case study: research → wireframes → hi-fi designs → prototype → user testing → presentation.", category: "Project", duration: "2 weeks", xp: 1200, whatYouLearn: ["Case study structure", "Presenting design decisions", "Portfolio site setup", "Client communication", "Design handoff"], resources: [{ name: "Behance", url: "https://www.behance.net/galleries/interaction", type: "practice" }, { name: "Dribbble", url: "https://dribbble.com", type: "practice" }, { name: "Case Study Club", url: "https://www.casestudy.club", type: "practice" }, { name: "UX Portfolio Tips", url: "https://www.nngroup.com/articles/ux-portfolio/", type: "docs" }, { name: "Framer Portfolio Sites", url: "https://www.framer.com/templates/portfolio/", type: "practice" }] },
  ],
  "Cloud & DevOps": [
    { title: "Linux & Command Line", description: "Get comfortable with Linux: shell commands, file systems, permissions, processes, SSH, and bash scripting essentials.", category: "Foundations", duration: "1 week", xp: 300, whatYouLearn: ["File system navigation", "File permissions & users", "Shell scripting", "Process management", "SSH & remote access"], resources: [{ name: "Linux Journey", url: "https://linuxjourney.com", type: "course" }, { name: "The Linux Command Line (free book)", url: "https://linuxcommand.org/tlcl.php", type: "book" }, { name: "OverTheWire: Bandit", url: "https://overthewire.org/wargames/bandit/", type: "practice" }, { name: "Bash Scripting Tutorial", url: "https://bash.cyberciti.biz/guide/Main_Page", type: "docs" }, { name: "MIT Missing Semester", url: "https://missing.csail.mit.edu", type: "course" }] },
    { title: "Containerization with Docker", description: "Understand containers vs VMs, build Docker images, manage containers, use volumes, networks, and docker-compose.", category: "DevOps", duration: "1.5 weeks", xp: 500, whatYouLearn: ["Docker images & containers", "Dockerfile best practices", "Docker volumes & networks", "docker-compose", "Multi-stage builds"], resources: [{ name: "Docker Official Docs", url: "https://docs.docker.com/get-started/", type: "docs" }, { name: "Play with Docker", url: "https://labs.play-with-docker.com", type: "practice" }, { name: "Docker Tutorial (TechWorld)", url: "https://www.youtube.com/watch?v=3c-iBn73dDE", type: "video" }, { name: "Docker Hub", url: "https://hub.docker.com", type: "practice" }, { name: "Docker Deep Dive (Nigel Poulton)", url: "https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton/dp/1916585256", type: "book" }] },
    { title: "AWS/Cloud Essentials", description: "Learn the most important AWS services: EC2, S3, Lambda, IAM, RDS, VPC, and the principles of cloud architecture.", category: "Cloud", duration: "2 weeks", xp: 600, whatYouLearn: ["EC2 & auto-scaling", "S3 storage & policies", "Lambda serverless functions", "IAM roles & policies", "VPC & networking"], resources: [{ name: "AWS Free Tier", url: "https://aws.amazon.com/free/", type: "practice" }, { name: "AWS Skill Builder", url: "https://explore.skillbuilder.aws", type: "course" }, { name: "A Cloud Guru", url: "https://acloudguru.com", type: "course" }, { name: "AWS Solutions Architect Guide", url: "https://docs.aws.amazon.com/pdfs/whitepapers/latest/aws-overview/aws-overview.pdf", type: "docs" }, { name: "CloudFormation Docs", url: "https://docs.aws.amazon.com/cloudformation/", type: "docs" }] },
    { title: "CI/CD Pipelines", description: "Automate testing, building, and deploying software with GitHub Actions, GitLab CI, and pipeline best practices.", category: "DevOps", duration: "1.5 weeks", xp: 500, whatYouLearn: ["GitHub Actions workflows", "Build & test automation", "Docker in CI/CD", "Environment secrets management", "Blue/green deployments"], resources: [{ name: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "docs" }, { name: "GitLab CI/CD Docs", url: "https://docs.gitlab.com/ee/ci/", type: "docs" }, { name: "CircleCI Tutorials", url: "https://circleci.com/docs/tutorials/", type: "docs" }, { name: "DevOps with GitHub (Microsoft)", url: "https://learn.microsoft.com/en-us/devops/", type: "course" }, { name: "Awesome CI/CD", url: "https://github.com/cicdops/awesome-ciandcd", type: "docs" }] },
    { title: "Kubernetes Orchestration", description: "Deploy and manage containerized apps at scale with Kubernetes: pods, services, deployments, ingress, and Helm charts.", category: "DevOps", duration: "2 weeks", xp: 700, whatYouLearn: ["Pods, nodes & clusters", "Services & ingress", "Deployments & scaling", "ConfigMaps & Secrets", "Helm chart basics"], resources: [{ name: "Kubernetes Official Docs", url: "https://kubernetes.io/docs/home/", type: "docs" }, { name: "KodeKloud K8s Course", url: "https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners-hands-on/", type: "course" }, { name: "Play with Kubernetes", url: "https://labs.play-with-k8s.com", type: "practice" }, { name: "Helm Docs", url: "https://helm.sh/docs/", type: "docs" }, { name: "CKAD Study Guide", url: "https://github.com/dgkanatsios/CKAD-exercises", type: "practice" }] },
    { title: "Infrastructure Project", description: "Design and deploy a multi-service production infrastructure with IaC, CI/CD, monitoring, and auto-scaling on a cloud platform.", category: "Project", duration: "2 weeks", xp: 1500, whatYouLearn: ["Terraform IaC", "Full cloud architecture", "Monitoring with Grafana", "Auto-scaling policies", "Cost optimization"], resources: [{ name: "Terraform Docs", url: "https://developer.hashicorp.com/terraform/docs", type: "docs" }, { name: "Vercel", url: "https://vercel.com/docs", type: "docs" }, { name: "AWS CloudFormation", url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html", type: "docs" }, { name: "Grafana Docs", url: "https://grafana.com/docs/grafana/latest/", type: "docs" }, { name: "DevOps Roadmap", url: "https://roadmap.sh/devops", type: "docs" }] },
  ],
  "Data Science": [
    { title: "Python & Data Wrangling", description: "Clean, transform, and explore data with Pandas. Handle missing values, merge datasets, and engineer features for analysis.", category: "Foundations", duration: "1.5 weeks", xp: 400, whatYouLearn: ["Pandas DataFrames & Series", "Data cleaning & missing values", "Merging & groupby operations", "Feature engineering", "Working with dates & strings"], resources: [{ name: "Pandas Getting Started", url: "https://pandas.pydata.org/docs/getting_started/", type: "docs" }, { name: "Kaggle Pandas Course", url: "https://www.kaggle.com/learn/pandas", type: "course" }, { name: "Real Python Pandas", url: "https://realpython.com/pandas-python-explore-dataset/", type: "docs" }, { name: "Python for Data Analysis (book)", url: "https://wesmckinney.com/book/", type: "book" }, { name: "Data Cleaning Challenge (Kaggle)", url: "https://www.kaggle.com/learn/data-cleaning", type: "practice" }] },
    { title: "Statistics & Visualization", description: "Create compelling visualizations with Matplotlib, Seaborn and Plotly. Apply descriptive statistics and understand distributions.", category: "Analysis", duration: "1.5 weeks", xp: 400, whatYouLearn: ["Descriptive statistics", "Matplotlib & Seaborn plots", "Plotly interactive charts", "Probability distributions", "Correlation analysis"], resources: [{ name: "StatQuest YouTube", url: "https://www.youtube.com/@statquest", type: "video" }, { name: "Seaborn Tutorial", url: "https://seaborn.pydata.org/tutorial.html", type: "docs" }, { name: "Plotly Express", url: "https://plotly.com/python/plotly-express/", type: "docs" }, { name: "Kaggle Data Visualization", url: "https://www.kaggle.com/learn/data-visualization", type: "course" }, { name: "Matplotlib Tutorials", url: "https://matplotlib.org/stable/tutorials/index.html", type: "docs" }] },
    { title: "SQL for Analytics", description: "Write complex SQL queries for analytics: window functions, CTEs, subqueries, data modeling, and database optimization.", category: "Database", duration: "1 week", xp: 300, whatYouLearn: ["Advanced SELECT & joins", "Window functions (ROW_NUMBER, RANK)", "CTEs & subqueries", "Data aggregation", "Query optimization"], resources: [{ name: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course" }, { name: "SQLZoo", url: "https://sqlzoo.net", type: "practice" }, { name: "LeetCode SQL", url: "https://leetcode.com/study-plan/sql/", type: "practice" }, { name: "StrataScratch", url: "https://www.stratascratch.com", type: "practice" }, { name: "SQL Murder Mystery", url: "https://mystery.knightlab.com", type: "practice" }] },
    { title: "Exploratory Data Analysis", description: "Systematically explore datasets: form hypotheses, find correlations, detect outliers, and uncover patterns through EDA.", category: "Analysis", duration: "1.5 weeks", xp: 500, whatYouLearn: ["EDA methodology", "Outlier detection", "Correlation heatmaps", "Feature relationships", "Storytelling with data"], resources: [{ name: "Kaggle EDA Notebooks", url: "https://www.kaggle.com/code?searchQuery=EDA", type: "practice" }, { name: "Towards Data Science", url: "https://towardsdatascience.com/tagged/exploratory-data-analysis", type: "docs" }, { name: "D3.js Docs", url: "https://d3js.org/getting-started", type: "docs" }, { name: "Sweetviz (auto-EDA)", url: "https://github.com/fbdesignpro/sweetviz", type: "docs" }, { name: "Pandas Profiling", url: "https://github.com/ydataai/ydata-profiling", type: "docs" }] },
    { title: "Machine Learning for DS", description: "Apply ML to data science: build predictive models, tune hyperparameters, handle imbalanced data, and interpret results.", category: "ML", duration: "2 weeks", xp: 600, whatYouLearn: ["Regression & classification", "Feature selection & importance", "Hyperparameter tuning (GridSearch)", "Handling imbalanced datasets", "Model interpretation (SHAP)"], resources: [{ name: "Scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", type: "docs" }, { name: "XGBoost Docs", url: "https://xgboost.readthedocs.io", type: "docs" }, { name: "MLflow Tracking", url: "https://mlflow.org/docs/latest/tracking.html", type: "docs" }, { name: "SHAP Values", url: "https://shap.readthedocs.io", type: "docs" }, { name: "Kaggle ML Courses", url: "https://www.kaggle.com/learn", type: "course" }] },
    { title: "Data Science Capstone", description: "Complete an end-to-end data science project: collect data, clean, explore, model, evaluate, and present findings professionally.", category: "Project", duration: "3 weeks", xp: 1500, whatYouLearn: ["Full DS project lifecycle", "Presenting to stakeholders", "Streamlit dashboard creation", "Reproducible research (notebooks)", "Data storytelling"], resources: [{ name: "Kaggle Competitions", url: "https://www.kaggle.com/competitions", type: "practice" }, { name: "Streamlit Docs", url: "https://docs.streamlit.io", type: "docs" }, { name: "Jupyter Book", url: "https://jupyterbook.org", type: "docs" }, { name: "DS Project Template", url: "https://github.com/drivendataorg/cookiecutter-data-science", type: "docs" }, { name: "Observable (data viz)", url: "https://observablehq.com", type: "practice" }] },
  ],
  "Cybersecurity": [
    { title: "Networking Fundamentals", description: "Understand how networks work: TCP/IP model, DNS, HTTP/S, firewalls, VLANs, and packet analysis with Wireshark.", category: "Foundations", duration: "1.5 weeks", xp: 400, whatYouLearn: ["TCP/IP & OSI model", "DNS & DHCP", "HTTP vs HTTPS", "Firewall rules", "Packet capture with Wireshark"], resources: [{ name: "CompTIA Network+ Study", url: "https://www.comptia.org/certifications/network", type: "course" }, { name: "Wireshark Docs", url: "https://www.wireshark.org/docs/wsug_html/", type: "docs" }, { name: "Cisco Networking Academy", url: "https://www.netacad.com/courses/networking", type: "course" }, { name: "Professor Messer N+ (free)", url: "https://www.professormesser.com/network-plus/n10-008/n10-008-video/n10-008-training-course/", type: "video" }, { name: "Networking Fundamentals (MS)", url: "https://learn.microsoft.com/en-us/training/paths/network-fundamentals/", type: "course" }] },
    { title: "Operating System Security", description: "Harden Linux and Windows systems. Learn privilege escalation, file permissions, log analysis, and OS-level security controls.", category: "Security", duration: "1.5 weeks", xp: 500, whatYouLearn: ["Linux file permissions & hardening", "Windows security policies", "Privilege escalation techniques", "Log analysis", "User & group management"], resources: [{ name: "TryHackMe", url: "https://tryhackme.com", type: "practice" }, { name: "HackTheBox", url: "https://www.hackthebox.com", type: "practice" }, { name: "OverTheWire: Bandit", url: "https://overthewire.org/wargames/bandit/", type: "practice" }, { name: "Linux Security Hardening", url: "https://www.cisecurity.org/benchmark/debian_linux", type: "docs" }, { name: "Windows Security Docs", url: "https://learn.microsoft.com/en-us/windows/security/", type: "docs" }] },
    { title: "Web Application Security", description: "Learn the OWASP Top 10 vulnerabilities: SQL injection, XSS, CSRF, SSRF, broken authentication, and how to test for them.", category: "AppSec", duration: "2 weeks", xp: 600, whatYouLearn: ["OWASP Top 10", "SQL injection & prevention", "XSS & CSRF attacks", "Burp Suite basics", "Secure coding practices"], resources: [{ name: "PortSwigger Web Academy", url: "https://portswigger.net/web-security", type: "practice" }, { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "docs" }, { name: "Burp Suite Docs", url: "https://portswigger.net/burp/documentation", type: "docs" }, { name: "DVWA (Damn Vulnerable Web App)", url: "https://github.com/digininja/DVWA", type: "practice" }, { name: "HackTheBox Web Challenges", url: "https://app.hackthebox.com/challenges", type: "practice" }] },
    { title: "Cryptography Essentials", description: "Understand how encryption works: symmetric/asymmetric algorithms, hashing, digital signatures, PKI, and TLS handshake.", category: "Crypto", duration: "1 week", xp: 400, whatYouLearn: ["Symmetric vs asymmetric encryption", "RSA & ECC", "SHA & MD5 hashing", "TLS/SSL handshake", "Digital certificates & PKI"], resources: [{ name: "Crypto101 (free book)", url: "https://crypto101.io", type: "book" }, { name: "Khan Academy Cryptography", url: "https://www.khanacademy.org/computing/computer-science/cryptography", type: "course" }, { name: "CyberChef", url: "https://gchq.github.io/CyberChef/", type: "practice" }, { name: "TLS Illustrated", url: "https://tls13.xargs.org", type: "docs" }, { name: "Cryptography (Coursera - Stanford)", url: "https://www.coursera.org/learn/crypto", type: "course" }] },
    { title: "Penetration Testing", description: "Learn ethical hacking methodology: reconnaissance, scanning, exploitation, post-exploitation, and professional reporting.", category: "Offensive", duration: "2 weeks", xp: 700, whatYouLearn: ["Recon & OSINT techniques", "Network scanning with Nmap", "Metasploit framework", "Privilege escalation", "Writing pentest reports"], resources: [{ name: "TryHackMe Pentest+", url: "https://tryhackme.com/path/outline/pentesting", type: "course" }, { name: "Metasploit Unleashed", url: "https://www.offensive-security.com/metasploit-unleashed/", type: "docs" }, { name: "Kali Linux Docs", url: "https://www.kali.org/docs/", type: "docs" }, { name: "eLearnSecurity", url: "https://elearnsecurity.com", type: "course" }, { name: "Nmap Book (free)", url: "https://nmap.org/book/toc.html", type: "book" }] },
    { title: "Security Capstone: CTF", description: "Compete in Capture the Flag challenges combining web, forensics, crypto, and reverse engineering. Build a real security portfolio.", category: "Project", duration: "2 weeks", xp: 1500, whatYouLearn: ["CTF methodology", "Web exploitation challenges", "Forensics & steganography", "Binary exploitation basics", "Documenting write-ups"], resources: [{ name: "PicoCTF", url: "https://picoctf.org", type: "practice" }, { name: "CTFtime", url: "https://ctftime.org", type: "practice" }, { name: "HackTheBox Challenges", url: "https://app.hackthebox.com/challenges", type: "practice" }, { name: "OverTheWire", url: "https://overthewire.org/wargames/", type: "practice" }, { name: "CTF Field Guide", url: "https://trailofbits.github.io/ctf/", type: "docs" }] },
  ],
};

// Generate personalized path based on interests and skill level
function generatePath(interests, skillLevel) {
  let path = [];
  let stepId = 1;

  for (const interest of interests) {
    const template = pathDatabase[interest];
    if (!template) continue;

    // Adjust based on skill level
    let steps = template;
    if (skillLevel === "intermediate") {
      steps = template.slice(1); // Skip basic foundations
    } else if (skillLevel === "advanced") {
      steps = template.slice(Math.floor(template.length / 2)); // Skip to advanced topics
    }

    for (const step of steps) {
      path.push({
        stepId: stepId++,
        ...step,
        status: stepId === 2 ? "current" : "locked"
      });
    }
  }

  // Mark first step as current
  if (path.length > 0) path[0].status = "current";

  return path;
}

// Submit assessment and generate personalized path
router.post("/", auth, async (req, res) => {
  try {
    const { interests, skillLevel, goals } = req.body;

    if (!interests || interests.length === 0) {
      return res.status(400).json({ error: "Please select at least one interest" });
    }

    const user = await User.findById(req.userId);

    // Generate personalized learning path
    const personalizedPath = generatePath(interests, skillLevel || "beginner");

    // Update user skills based on interests
    const skillMap = {
      "Web Development": ["JavaScript", "React", "Node.js", "CSS/Tailwind"],
      "AI & Machine Learning": ["Python", "TensorFlow", "Data Science"],
      "Mobile Development": ["React Native", "TypeScript", "Mobile UI"],
      "UI/UX Design": ["Figma", "Design Systems", "Prototyping"],
      "Cloud & DevOps": ["AWS", "Docker", "Kubernetes", "CI/CD"],
      "Data Science": ["Python", "SQL", "Statistics", "Visualization"],
      "Cybersecurity": ["Networking", "Linux", "Ethical Hacking"],
    };

    // Skills start at 0 — they grow as the user completes learning path steps
    const newSkills = [];
    for (const interest of interests) {
      const interestSkills = skillMap[interest] || [];
      for (const s of interestSkills) {
        if (!newSkills.find(ns => ns.name === s)) {
          newSkills.push({ name: s, level: 0 });
        }
      }
    }

    user.assessmentCompleted = true;
    user.interests = interests;
    user.personalizedPath = personalizedPath;
    user.skills = newSkills;
    user.xp += 100; // Bonus XP for completing assessment

    // Unlock "First Steps" achievement for completing assessment
    const Achievement = require("../models/Achievement");
    const Notification = require("../models/Notification");
    const firstSteps = await Achievement.findOne({ title: "First Steps" });
    const alreadyHas = user.achievements.some(
      a => a.achievementId?.toString() === firstSteps?._id?.toString()
    );
    if (firstSteps && !alreadyHas) {
      user.achievements.push({ achievementId: firstSteps._id, unlockedAt: new Date() });
      user.xp += 50;
      await Notification.create({
        userId: user._id,
        type: "achievement",
        title: `Achievement Unlocked: First Steps! 🏆`,
        message: `You completed the assessment and earned the "First Steps" badge! +50 XP`,
        icon: firstSteps.icon || "🏆",
        link: "/dashboard"
      });
    }

    await user.save();

    res.json({
      message: "Learning path generated!",
      personalizedPath,
      skills: newSkills,
      xpEarned: 100
    });
  } catch (error) {
    console.error("Assessment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get assessment status
router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("assessmentCompleted interests personalizedPath");
    res.json({
      completed: user.assessmentCompleted,
      interests: user.interests,
      personalizedPath: user.personalizedPath
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Complete a learning path step
router.put("/step/:stepId/complete", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const stepId = parseInt(req.params.stepId);
    const step = user.personalizedPath.find(s => s.stepId === stepId);

    if (!step) return res.status(404).json({ error: "Step not found" });
    if (step.status === "completed") return res.status(400).json({ error: "Already completed" });
    if (step.status === "locked") return res.status(400).json({ error: "Step is locked" });

    // Mark step as completed
    step.status = "completed";
    user.xp += step.xp || 100;

    // Grow relevant skills based on completed step category
    const categorySkillMap = {
      "Frontend": ["JavaScript", "React", "CSS/Tailwind"],
      "Backend": ["Node.js", "SQL"],
      "ML": ["Python", "TensorFlow", "Data Science"],
      "Foundations": ["Python", "JavaScript"],
      "NLP": ["Python", "TensorFlow"],
      "Mobile": ["React Native", "TypeScript", "Mobile UI"],
      "DevOps": ["AWS", "Docker", "Kubernetes", "CI/CD"],
      "Cloud": ["AWS", "Docker", "Kubernetes"],
      "Research": ["Design Systems", "Figma"],
      "Design": ["Figma", "Design Systems"],
      "Tools": ["Figma"],
      "Database": ["SQL"],
      "Analysis": ["Python", "SQL", "Statistics", "Visualization"],
      "Security": ["Networking", "Linux", "Ethical Hacking"],
      "AppSec": ["Networking", "Ethical Hacking"],
      "Offensive": ["Ethical Hacking", "Networking"],
      "Crypto": ["Networking"],
      "Math": ["Statistics"],
      "Project": [], // Projects don't directly grow specific skills
    };
    const relatedSkills = categorySkillMap[step.category] || [];
    for (const skillName of relatedSkills) {
      const skill = user.skills.find(s => s.name === skillName);
      if (skill) {
        skill.level = Math.min(100, skill.level + 5);
      }
    }
    user.markModified("skills");

    // Unlock next step
    const nextStep = user.personalizedPath.find(s => s.stepId === stepId + 1);
    if (nextStep && nextStep.status === "locked") {
      nextStep.status = "current";
    }

    // Track weekly activity - add study hours for today
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = days[new Date().getDay()];
    const dayEntry = user.weeklyActivity.find(d => d.day === today);
    if (dayEntry) {
      dayEntry.hours = Math.min(5, dayEntry.hours + 1);
    }

    // Update streak
    user.streak = Math.max(1, user.streak);

    user.markModified("personalizedPath");
    user.markModified("weeklyActivity");
    await user.save();

    // Create notification
    const Notification = require("../models/Notification");
    await Notification.create({
      userId: user._id,
      type: "achievement",
      title: `Step Completed: ${step.title}! 🎉`,
      message: `You earned +${step.xp || 100} XP. ${nextStep ? `Next: ${nextStep.title}` : "You completed the entire path! 🏅"}`,
      icon: "✅",
      link: "/dashboard"
    });

    const completedCount = user.personalizedPath.filter(s => s.status === "completed").length;
    const totalCount = user.personalizedPath.length;

    res.json({
      message: "Step completed!",
      xpEarned: step.xp || 100,
      nextStep: nextStep ? { stepId: nextStep.stepId, title: nextStep.title } : null,
      completedCount,
      totalCount,
      totalXP: user.xp,
      personalizedPath: user.personalizedPath
    });
  } catch (error) {
    console.error("Step complete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Log study activity
router.post("/log-activity", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { hours } = req.body;
    const addHours = Math.min(hours || 0.5, 2);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = days[new Date().getDay()];
    const dayEntry = user.weeklyActivity.find(d => d.day === today);
    if (dayEntry) {
      dayEntry.hours = Math.min(5, dayEntry.hours + addHours);
    }

    user.streak = Math.max(1, user.streak);
    user.markModified("weeklyActivity");
    await user.save();

    res.json({ weeklyActivity: user.weeklyActivity, streak: user.streak });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

