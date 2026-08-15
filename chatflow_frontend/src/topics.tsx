import { useNavigate } from "react-router-dom";
import "./topics.css";
import history from '../public//Catopics/History.jpg'
import personaldevelop from '../public/Catopics/self DEVELOP.jpg'

const Topics = () => {
    const navigate = useNavigate();

const topics = [
    {
        title: "جعبه تاریخ",
        slug: "history",
        image: history,
    },
    {
        title: "جعبه هوش مصنوعی",
        slug: "ai",
    },
    {
        title: "جعبه روانشناسی",
        slug: "psychology",
    },
    {
        title: "جعبه فیلم و سریال",
        slug: "movies",
    },
    {
        title: "جعبه اخبار",
        slug: "news",
    },
    {
        title: "جعبه شعر و ادبیات",
        slug: "poetry-literature",
    },
    {
        title: "جعبه برنامه نویسی",
        slug: "programming",
    },
    {
        title: "جعبه توسعه فردی",
        slug: "personal-development",
        image: personaldevelop,
    },
    {
        title: "جعبه کتاب",
        slug: "books",
    },
    {
        title: "جعبه ویدیو گیم",
        slug: "video-games",
    },
    {
        title: "جعبه علم",
        slug: "science",
    },
];

    return (
    <main className="topics-page">

        <div className="topics-header">
            <span>MESSAGESBOX</span>

            <h1>
                جعبه‌های گفتگو
            </h1>

            <p>
                موضوع مورد علاقه‌ات رو انتخاب کن و وارد گفتگو شو.
            </p>
        </div>

        <nav className="topics">

            {topics.map((topic) => (

                <button
                    className="topic"
                    key={topic.slug}
                    type="button"
                    onClick={() =>
                        navigate(`/topics/${topic.slug}`)
                    }
                    style={
                        topic.image
                            ? {
                                backgroundImage: `url("${topic.image}")`
                            }
                            : undefined
                    }
                >

                    <div className="topic-overlay">

                        <span className="topic-icon">
                            #
                        </span>

                        <span className="topic-title">
                            {topic.title}
                        </span>

                        <span className="topic-arrow">
                            ←
                        </span>

                    </div>

                </button>

            ))}

        </nav>

    </main>
);
};

export default Topics;