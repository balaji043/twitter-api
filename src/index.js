var { secrtetKey } = require("./SecretKey");

const app = require("express")();
const faunadb = require("faunadb");
const client = new faunadb.Client({
  secret: secrtetKey,
});
const q = faunadb.query;

app.listen(5000, () => {
  console.log("API on 5000");
});

app.get("/tweet/:id", async (req, res) => {
  try {
    const doc = await client.query(
      q.Get(q.Ref(q.Collection("tweets"), req.params.id))
    );
    res.send(doc);
  } catch (error) {
    res.send(error);
  }
});

app.post("/tweet", async (req, res) => {
  console.log("-------------start-----------------");
  try {
    const userName = req.header("x-bam-userName");
    const text = req.query.text;
    console.log(userName, text);
    if (!userName || !text) {
      return;
    }
    const data = {
      user: q.Select("ref", q.Get(q.Match(q.Index("users_by_name"), userName))),
      text: text,
    };
    const doc = await client.query(q.Create(q.Collection("tweets"), { data }));
    res.send(doc);
  } catch (error) {
    res.send(error);
  }
});

app.get("/tweet", async (req, res) => {
  console.log("-------------start-----------------");
  try {
    const doc = await client.query(
      q.Paginate(
        q.Match(
          q.Index("tweets_by_user"),
          q.Call(q.Function("getUser"), req.header("x-bam-userName"))
        )
      )
    );
    res.send(doc);
  } catch (error) {
    res.send(error);
  }
});
