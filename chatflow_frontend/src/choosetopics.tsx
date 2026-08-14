import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./choosetopics.css";

interface Topic {
    id: number;
    name: string;
    slug: string;
}

const ChooseTopics = () => {

    const navigate = useNavigate();
    const {slug} = useParams()
    const [topics, setTopics] = useState<Topic[]>([]);
    const [topicName, setTopicName] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);


    useEffect(() => {

        const getTopics = async () => {

            try {

                const res = await axios.get(
                    `https://massagesbox.ir/message/${slug}/`
                );

                setTopics(res.data);

            } catch (error) {

                console.error("Error getting topics:", error);

            } finally {

                setLoading(false);

            }
        };

        if (slug) {
            getTopics();
        }

    }, [slug]);


  
    const createTopic = async () => {

        const name = topicName.trim();

        if (!name) {
            return;
        }

        try {

            setCreating(true);

            const res = await axios.post(
                `https://massagesbox.ir/rooms/${slug}/`,
                {
                    name: name
                }
            );

            navigate(`/message/${slug}/${res.data.slug}`, { replace: true });

            // اضافه کردن تاپیک جدید به لیست
            setTopics((prev) => [
                ...prev,
                res.data
            ]);

            // خالی کردن input
            setTopicName("");

        } catch (error) {

            console.error("Error creating topic:", error);

        } finally {

            setCreating(false);

        }
    };


    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {

        if (e.key === "Enter") {
            createTopic();
        }

    };


    return (
        <main className="topics-page">

            <section className="topics-container">

                {/* Header */}
                <div className="topics-header">

                    <span className="topics-badge">
                        MESSAGESBOX
                    </span>

                    <h1>
                        موضوع گفتگوت رو انتخاب کن
                    </h1>

                    <p>
                        یک موضوع را انتخاب کن یا موضوع جدیدی
                        برای گفتگو بساز.
                    </p>

                </div>


                {/* ساخت Topic */}
                <div className="create-topic">

                    <label htmlFor="topic">
                        اضافه کردن تاپیک
                    </label>

                    <div className="topic-input">

                    <form>

                        <input
                            id="topic"
                            type="text"
                            value={topicName}
                            onChange={(e) =>
                                setTopicName(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="تاپیک خود را بنویسید..."
                        />

                        <button
                            onClick={createTopic}
                            disabled={
                                creating ||
                                !topicName.trim()
                            }
                        >
                            {creating ? "در حال ساخت..." : "افزودن"}
                        </button>

                    </form>

                    </div>

                </div>


                {/* Topics */}
                <div className="topics-section">

                    <h2>
                        تاپیک‌های این روم
                    </h2>


                    {loading ? (

                        <div className="topics-loading">
                            در حال دریافت تاپیک‌ها...
                        </div>

                    ) : topics.length === 0 ? (

                        <div className="no-topics">
                            هنوز تاپیکی ساخته نشده.
                            <br />
                            اولین تاپیک را تو بساز!
                        </div>

                    ) : (

                        <div className="topics-list">

                            {topics.map((topic) => (

                                <button
                                    className="topic-card"
                                    key={topic.id}
                                    onClick={() =>
                                        navigate(`/topics/${slug}/${topic.slug}`)
                                    }
                                >

                                    <div className="topic-card-content">

                                        <span className="topic-icon">
                                            #
                                        </span>

                                        <div>

                                            <h3>
                                                {topic.name}
                                            </h3>

                                            <span>
                                                ورود به گفتگو
                                            </span>

                                        </div>

                                    </div>

                                    <span className="topic-arrow">
                                        ←
                                    </span>

                                </button>

                            ))}

                        </div>

                    )}

                </div>

            </section>

        </main>
    );
};

export default ChooseTopics;