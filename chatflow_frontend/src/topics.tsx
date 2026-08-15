import { useNavigate } from "react-router-dom";
import "./topics.css";


const Topics = () => {
    const navigate = useNavigate();

const topics = [
    {
        title: "جعبه تاریخ",
        slug: "history",
        image: "/Catopics/History.jpg",
    },
    {
        title: "جعبه هوش مصنوعی",
        slug: "ai",
        image: "/Catopics/AI.jpg",
    },
    {
        title: "جعبه روانشناسی",
        slug: "psychology",
        image: "/Catopics/Clindical-Psycology.jpg",
    },
    {
        title: "جعبه فیلم و سریال",
        slug: "movies",
        image: "/Catopics/MOVIES.jpg",
    },
    {
        title: "جعبه اخبار",
        slug: "news",
        image: "/Catopics/NEWS.jpg",
    },
    {
        title: "جعبه شعر و ادبیات",
        slug: "poetry-literature",
        image: "/Catopics/Poems-literature.jpg",
    },
    {
        title: "جعبه برنامه نویسی",
        slug: "programming",
        image: "/Catopics/Programming.jpg",
    },
    {
        title: "جعبه توسعه فردی",
        slug: "personal-development",
        image: "/Catopics/self-DEVELOP.jpg",
    },
    {
        title: "جعبه ویدیو گیم",
        slug: "video-games",
        image: "/Catopics/GAMES.jpg",
    },
    {
        title: "جعبه کسب‌وکار",
        slug: "business",
        image: "/Catopics/BUSSINESS.jpg",
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