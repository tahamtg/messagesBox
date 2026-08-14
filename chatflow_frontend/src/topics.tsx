import { useNavigate } from "react-router-dom";
import "./topics.css";

const Topics = () => {
    const navigate = useNavigate();

const topics = [
    {
        title: "جعبه تاریخ",
        slug: "history",
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
        <nav className="topics">
            {topics.map((topic) => (
                <div className="topic" key={topic.slug}>
                    <button
                        type="button"
                        onClick={() => navigate(`/topics/${topic.slug}`)}
                    >
                        {topic.title}
                    </button>
                </div>
            ))}
        </nav>
    );
};

export default Topics;