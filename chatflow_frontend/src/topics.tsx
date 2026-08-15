import { useNavigate } from "react-router-dom";
import "./topics.css";
import history from '../public//Catopics/History.jpg'
import personaldevelop from '../public/Catopics/self DEVELOP.jpg'
import BUSSINESS from '../public/Catopics/BUSSINESS.jpg'
import NEWS from '../public/Catopics/NEWS.jpg'
import MOVIES from '../public/Catopics/MOVIES.jpg'
import GAMES from '../public/Catopics/GAMES.jpg'
import Programming from '../public/Catopics/Programming.jpg'
import Poemsliterature from '../public/Catopics/Poems & literature.jpg'
import AI from '../public/Catopics/AI.jpg'
import ClindicalPsycology from '../public/Catopics/Clindical Psycology.jpg'


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
        image: AI,
    },
    {
        title: "جعبه روانشناسی",
        slug: "psychology",
        image: ClindicalPsycology,
    },
    {
        title: "جعبه فیلم و سریال",
        slug: "movies",
        image: MOVIES,
    },
    {
        title: "جعبه اخبار",
        slug: "news",
        image: NEWS,
    },
    {
        title: "جعبه شعر و ادبیات",
        slug: "poetry-literature",
        image: Poemsliterature,
    },
    {
        title: "جعبه برنامه نویسی",
        slug: "programming",
        image: Programming,
    },
    {
        title: "جعبه توسعه فردی",
        slug: "personal-development",
        image: personaldevelop,
    },
    {
        title: "جعبه کتاب",
        slug: "books",
        image: history, 
    },
    {
        title: "جعبه ویدیو گیم",
        slug: "video-games",
        image: GAMES,
    },
    {
        title: "جعبه کسب و کار",
        slug: "bussiness",
        image: BUSSINESS, 
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