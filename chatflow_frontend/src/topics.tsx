import { useNavigate } from "react-router-dom";
import "./topics.css";
import history from "../public/Catopics/History.jpg";
import personalDevelop from "../public/Catopics/self DEVELOP.jpg";
import business from "../public/Catopics/BUSSINESS.jpg";
import news from "../public/Catopics/NEWS.jpg";
import movies from "../public/Catopics/MOVIES.jpg";
import games from "../public/Catopics/GAMES.jpg";
import programming from "../public/Catopics/Programming.jpg";
import poemsLiterature from "../public/Catopics/Poems & literature.jpg";
import ai from "../public/Catopics/AI.jpg";
import clinicalPsychology from "../public/Catopics/Clindical Psycology.jpg";


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
    image: ai,
},
{
    title: "جعبه روانشناسی",
    slug: "psychology",
    image: clinicalPsychology,
},
{
    title: "جعبه فیلم و سریال",
    slug: "movies",
    image: movies,
},
{
    title: "جعبه اخبار",
    slug: "news",
    image: news,
},
{
    title: "جعبه شعر و ادبیات",
    slug: "poetry-literature",
    image: poemsLiterature,
},
{
    title: "جعبه برنامه نویسی",
    slug: "programming",
    image: programming,
},
{
    title: "جعبه توسعه فردی",
    slug: "personal-development",
    image: personalDevelop,
},
{
    title: "جعبه ویدیو گیم",
    slug: "video-games",
    image: games,
},
{
    title: "جعبه کسب‌وکار",
    slug: "business",
    image: business,
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