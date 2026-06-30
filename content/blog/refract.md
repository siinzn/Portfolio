---
title: "Refract"
date: "30-06-2026"
description: "Advanced NLP + RAG based audience intelligence engine"
---

## Introduction

Refract is an advanced NLP + RAG based audience intelligence engine for systems programming discussions. Collects and analyzes ~46,000 real developer comments from YouTube and Stack Overflow, enriches them with sentiment analysis, keyword extraction, named entity recognition, and topic modeling, then indexes everything into a vector database to support grounded question answering, semantic retrieval, and evidence-backed insights.

## Dataset collection

So to start of this project, i wanted to search for youtube comments using my code and not providing the videos myself. This is to keep the whole project consistent with the style and for my ego as well.

#### Youtube Search

There is two section for youtube search. First is to actually search for the videos and get their video ID. For this, i have a list of 9 search queries that target discussion heavy and opinion based videos rather than tutorials. This is important because tutorial videos have comments like "day 47 of learning" or "thanks great video" which is completely useless for NLP analysis. Queries like "C++ vs Rust", "the truth about C++", "why C++ is hard" are more likely to attract debates, frustrations, and strong opinions which is exactly what i want.

For each query, i call search().list() which returns 10 videos per query. I then collect all the video IDs across all queries and deduplicate them using a set to avoid calling the same video twice and wasting quota. After that i call videos().list() to get the actual statistics for each video like comment count and view count. One thing to note is that search().list() does not return statistics, so these are two separate API calls. The videos().list() endpoint supports batching up to 50 IDs per call, so i used itertools.batched() to chunk the IDs into groups of 50 before calling.

After getting the stats back, i filter videos by a minimum of 200 comments and 10,000 views to make sure videos have enough engagement and actual discussion. Then sort by comment count descending and take the top 20. The final list is saved to data/videoIds/videos.json.

For comment extraction, i use commentThreads().list() with order="time" instead of order="relevance". This is because relevance ordering does not paginate through all comments, it stops early. Time ordering gives all top level comments. For each video i paginate through using nextPageToken until there are no more pages. Each page returns 100 comments so this loops until all comments are collected. I collect author, timestamp, like count, comment text, and video ID per comment. All comments across all 20 videos are concatenated into a single DataFrame and saved to data/raw/comments.csv. Final dataset had around 25,000 raw YouTube comments.

#### Stackoverflow

For Stack Overflow data i used the Stack Exchange Data Explorer which is a free SQL interface to query the Stack Overflow database directly. No scraping, no API limits, just SQL. The query joins the Posts table with itself to get answers alongside their parent question tags. I filtered by PostTypeId = 2 (answers only), a minimum score of 10 to ensure quality, and tags matching C++, systems-programming, linux-kernel, memory-management, posix, operating-system, compiler, and multithreading. Results are ordered by score descending and limited to 30,000 rows. The downloaded CSV contains answer body, score, question title, tags, and creation date.

## Preprocessing

Preprocessing is done using a Cleaner class in src/preprocessing/cleaner.py. The reason i made this a class rather than a bunch of functions is that it holds configuration - source label, column name, and minimum word threshold that needs to be consistent across all methods. It also makes it reusable across both YouTube and Stack Overflow datasets without duplicating logic. Same class, different parameters.

The run() method chains everything in order and returns the final cleaned DataFrame. Each method takes a DataFrame in and returns a DataFrame out, so they can be chained cleanly.

Remove Duplicates - uses drop_duplicates() on the text column. Pandas uses a hash set internally for this so lookup is O(1) per row rather than the O(n²) of a naive nested loop approach. Duplicates come from overlapping video search results or paginated comment overlaps.

Remove HTML - Stack Overflow answers are stored as raw HTML with tags like `<p>, <code>, <strong>` etc. This step uses BeautifulSoup to strip all HTML tags and extract plain text. This only runs for Stack Overflow since YouTube comments are plain text.

Filter Length - removes comments or answers below a minimum word count threshold. For YouTube i used 8 words and for Stack Overflow i used 15 words. Anything shorter is almost always noise — timestamps, emoji reactions, milestone comments like "day 47 of learning", single word reactions. The word count is computed using .str.split().str.len() which splits on whitespace and counts the resulting list length.

Filter Language - keeps only English text. The approach here is a two stage check to avoid running langdetect on every row since it is slow. First i check if the text is pure ASCII using .isascii() — if it is, it is almost certainly English so i keep it immediately without calling langdetect. Only non ASCII text goes through langdetect.detect() for proper language identification. This saves a significant number of function calls on a 25,000 row dataset.

Text Clean - this is the main cleaning step. In order it decodes HTML entities like &amp; → & using html.unescape(), removes URLs, removes @mentions, removes unusual unicode characters like \u2028 line separators that appear from mobile copy pastes, removes day milestone patterns like "Day 47", removes timestamp references like "14:32", and normalizes whitespace. Importantly, this creates a new column text_clean rather than overwriting the original text column so raw data is always preserved.

After text cleaning, a source column is added with the value "youtube" or "stackoverflow" and a word_count column is computed from text_clean. The final cleaned datasets had ~17,000 YouTube comments and ~29,000 Stack Overflow answers.

## Analysis

Analysis is handled by a single Analyser class in src/analysis/analyser.py. All models are initialized once in **init** and reused across method calls. This matters because models like VADER, RoBERTa, KeyBERT, spaCy, and BERTopic are all heavy to load. If they were initialized inside each method they would reload on every row which would be extremely slow. The class runs the same pipeline on both datasets separately since sentiment models differ per source.

Sentiment Analysis - two different models are used depending on the source. For YouTube i used VADER (Valence Aware Dictionary and Sentiment Reasoner). VADER is rule based and works well on short informal text with slang, capitalization, and punctuation as sentiment signals. It returns a compound score between -1 and 1 which i threshold into positive (above 0.05), negative (below -0.05), and neutral (between). For Stack Overflow i used Cloudy1225/stackoverflow-roberta-base-sentiment from HuggingFace which is a RoBERTa model specifically fine tuned on Stack Overflow data. This handles longer technical text better than VADER. One issue i ran into was that some Stack Overflow answers were extremely long (up to 27,000 characters) which caused the tokenizer to hang. The fix was to truncate each answer to 2000 characters before passing to the model since the first 2000 characters are enough to capture the overall sentiment.

Keyword Extraction - uses KeyBERT which uses BERT embeddings to find the most semantically representative keywords from each text rather than just the most frequent words. I extract the top 5 keywords per comment using bigrams (1-2 word phrases) with English stopwords removed. The most important performance decision here was to pass all texts as a batch to extract_keywords() rather than calling it row by row. This lets the model process them together which is significantly faster.

Named Entity Recognition - uses spaCy with the en_core_web_md model. I used the medium model rather than small because the word vectors in medium help it handle technical vocabulary better. On top of spaCy's pretrained model i added a custom entity ruler with a predefined list of domain specific terms like C++, RAII, LLVM, GCC, valgrind, undefined behavior etc that spaCy might miss or mislabel. The ruler runs before spaCy's NER so custom terms are always caught correctly. Same batching approach as KeyBERT, I pass all texts through nlp.pipe() at once rather than one by one.

Topic Modeling - Uses BERTopic which works in three stages internally. First it embeds every comment using all-MiniLM-L6-v2. Then it clusters similar embeddings together using HDBSCAN. Then it labels each cluster with the most representative words using c-TF-IDF. I configured HDBSCAN with min_cluster_size=100 which means at least 100 documents are needed to form a topic this prevents the model from creating hundreds of tiny micro-topics which happened in early runs (209 topics from 17,000 comments is too many). I also passed a CountVectorizer with stop_words='english' to BERTopic which cleans up the topic labels — without this, topic names were dominated by stopwords like "the_to_and_is" rather than meaningful technical terms. After tuning, YouTube ended up with 18 coherent topics and Stack Overflow with 44. Each comment gets a topic_id and a topic_label.

After all four steps, drop_nulls() removes any rows where enrichment columns are missing, and the final enriched datasets are saved. Both datasets are then merged using pd.concat() into merged_dataset.csv with 46,404 total rows before going into the vector database.

## Embeddings

This is relatively an easy. Just a class that initialize the model and the function which returns the vector. I went with a class for a small code like this is because of the model. If i had written a function, the model had to be called every time the code runs, with class initialization, i just have to call it once, and then i can keep reusing it. This is does increase performance to some degree.

The get_embeddings() function itself is pretty simple. It takes a dataframe as param. We have to make our dataframe into a list because the model does not support dataframes. It supports either a Strings or list of strings. `show_progress_bar=True` like the name says, is to see progress of the function (model.encode). `batch_size=64` is just making it easier for the embedding model to be slightly faster for processing all the data (My dataset is around 46k rows).

One of the main problems or a set back i have faced during embedding is deciding whether to save the embedding as a .npy file or save it in my dataframe. The issue with with saving to a dataframe is that, numpy arrays does not really store well in a CSV column. It would just make my life harder later on to retrieve it and then use it. Next way was to save as a .npy file. This was even more of a risk because then i will have two files one CSV and one .npy and both these files have to be aligned row by row. if it is not this project may as well be thrown away. Meaning if the .npy file somehow got corrupted, embedding of row 10 may not be the actual embedding, it may be of some other row (idk why i cant put it to words, i meant rows need to match if they dont its bad). So my claude suggested that i dont store anythign anywhere, but i just return the numpy from the `get_embedding` function and pass that directly to weaviate. This takes away all risks of data corruption but it may take my time(est 10-20 minutes) if i have to re run embedding again. Pretty intresting isnt it hehe.

## Vector DB (Weaviate)

To begin with, vector db is just way of storing data that can accessed pretty easily using indexing. This is done with the help of the embedding we got from the previous stage. So to build a vector db with weaviate we need to have

1 - Create `Property`(rules for data) which defines name of the data being stored, datatype, and some textbook values which help with the vector db(not necessary to know all). So i wanted to find a good way to make these properties and in a clean way, i just made a function with params of name,datatype, description and indexsearch. Rest can be default but those params are different for each. IndexSearch is same for all except for datatype INT. IndexSearch only works with text or text array.

2 - Create a collection(basically a schema). To create a collection, use `collections.create()`
This takes in 4 params atleast thats what i used. Name is the name of the collection. Vector Configuration - For this we need to specify if we are providing the vector or should weaviate handle it. I used `self_provided`, which is better in most cases. Next we need to define what search algorithm should be used. For this project i used, HNSW which is a graph based algo with
O(log)n search. `VectorDistances.COSINE` - measures the angle between two vectors rather than their length. `ef=128` - is how many neigbouring vector to check before giving a result.
`ef_construction=128` - same as ef but for while index building. `max_connections=64` - each vector will connect to a maximum of 64 neighboring vectors. Then next param is properties which we made using our function earlier. and lastly our BM25 which is a keyword seach algorithm.
`Configure.inverted_index` has two params, `bm25_k1=1.2` & `bm25_b=0.75` well to both of these im not sure because i cant understand you search it yourself. Those are textbook values, so thats all that matters for now.

3 - Load data into collection. We made the schema and now we have to insert values into it. we make insert data into to the collection in batches to make it easy for our cpus. One thing to point out is i used `for i, row in df.iterrows()` which now i think about it may not have been the right choice and i could have used enumerate, maybe ill fix and rerun the weaviate. Anyways we just loop through my dataset. One thing here is that sentiment
score `"sentiment_score" : None if math.isnan(row['sentiment_score']) else row['sentiment_score']` is only for youtube comments due to different model used for sentiment analysis regardless the sentiment label stays the same. This is same for like count(not there for stackoverflow) and author(author is yt commenter). Keyword and Entities were stored as list as strings i had to convert them to lists using `ast.literal_eval()`. To be honest i should have handled that while making those column in analysis but yeah.

Thats pretty much it for the Vector DB.

## Retrieval

For Refract, I will be using hybrid retrieval even thoough i did the code for semantic retrieval to see comparison. Just for information, Hybrid is semantic retireval and BM25 Keyword Search together. So for hybrid retrieval `query.hybrid()` function it has some params that needs to be passed on. Query text is passed on when class initialization. Next we pass our vector from embedding which is initialized in the class. Next we pass alpha and i have set it to 0.5 default. It just means the distribution of semantic and BM25 is 50% each. `MetadataQuery(score=True, explain_score=True)` this is just giving us the score3 and explaining why that score is given. `HybridFusion.RELATIVE_SCORE` - a bit hard to understand. From my understanding it just gives a score between 0-1 based on relative score since we are mixing semantic and BM25, we have two values/scores to work with and to get a centralized score this is needed. Limit is saying you only need that many documents to be returned from the function. Here i have set it to 3, thats more than enough to work with.

## RAG

Now that we did the embeddings, vector db, and the hybrid retrieval. Now this is where we use the vector db to answer questions. I wanted refract to be answer questions about systems programming, but if the question is out of bounds/if its completely unrelated to systems programming it should use gemini 2.5 flash to answer the question. So basically regardless it will answer. So we need to get a score from the retrieved answer to decide whether to use Ollama for answer generation or use the fallback(gemini 2.5 flash). So we compute score with the result of hybrid retrieval and if the score is less than threshold(which is passed onto the class) then it uses gemini otherwise it uses Ollama. So initially to calculate score i was using 4 different scores and then dividing by 4, but i decided to cut out sentiment score and topic label score (tbh this was pointless to use them). So now in the codes i just have result count of whatever weaviate returned and hybrid score which is generated by weaviate devide by 2 and thats it. Now there is a flaw or a problem with this whihc i cannot solve at the moment which is that whatever question is askeed it always returns the confidence score somewhat in 0.5 range. for example if i asked "who is sinan in UOWD" it will say that confidence score is 0.566 even though its completely out of my dataset. I cannot find a way to fix this atm, will get back to it later on.

Now moving onto the routing of answer generation, we get the score and if its less than threshold we just use gemini2.5-flash and return the answer and label the source as GenAI. If the score is more than 0.5 we first get the context. Context is basically just giving out model information that was retrieved using weaviate. Then we use that context inside a prompt which is then given to the Ollama model along with instructions such the model is an expert analyst of developer dicussions for systems programming and to not add any extra information, use only the data that was from the weaviate. Then we just return the response along with source used and evidence which shows what comments/stackoverflow was used to given that specific answer.

## Streamlit Interface

The interface is built with Streamlit in main.py at the project root. It takes a user query through a text input, passes it to the RAG system, and displays the results in several sections.

The answer is displayed first followed by the source (YouTube, Stack Overflow, or Ollama fallback) and a confidence progress bar showing the percentage score computed from the retrieval results.

If the answer is grounded in retrieved data rather than the fallback model, four additional visual sections appear below:

Sentiment Breakdown - a bar chart showing the distribution of positive, negative, and neutral sentiment across the retrieved evidence. This gives an immediate visual read on how developers feel about the queried topic.

Source Breakdown - a bar chart showing how many of the retrieved results came from YouTube versus Stack Overflow, giving context on which community contributed to the answer.

Top Keywords - a bar chart of the most frequent technical terms extracted from the retrieved comments and answers. This shows what specific concepts and tools are most associated with the query in the dataset.

YouTube vs Stack Overflow - a two column side by side comparison of what YouTube developers said versus what Stack Overflow experts said about the same query. This is the most unique feature of Refract since no generic AI can show this kind of dual source perspective from real developer discussions.

Finally a collapsible expander shows the full evidence, each individual comment or answer that was retrieved, along with its source, sentiment label, and author.
