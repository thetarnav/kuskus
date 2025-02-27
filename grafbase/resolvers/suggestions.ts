import Stripe from "stripe"
import { Redis } from "@upstash/redis"

// eslint-disable-next-line turbo/no-undeclared-env-vars
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
  typescript: true,
})

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

type CachedTask = {
  subtasks: SuggestedTasks[]
}

type SuggestedTasks = {
  title: string
  note: string
}

export default async function Resolver(
  _: any,
  { task }: { task: string },
  context: any
) {
  // cache string purpose is to make semantically same task requests
  // hit the cache
  // TODO: expand to add more cases
  // like different panctuation should not avoid hitting the cache
  const cacheString = task
    .replace(" a ", "-") // remove all `a` and `an` from the task to put in cache
    .replace(" an ", "-") // do it in a better way, regex?
    .split(" ")
    .join("-")
    .toLowerCase()

  const cachedTask: CachedTask | null = await redis.get(
    `gpt-3-subtasks-${cacheString}`
  )
  if (cachedTask) {
    console.log(JSON.stringify(cachedTask.subtasks))
    return {
      suggestedTasks: cachedTask.subtasks,
      stripeCheckoutUrl: null,
    }
  }

  // TODO: fix below
  // ai should work
  // stripe return page should work too
  return {}

  // TODO: there should probably be a better way than userCollection
  // but for that I need to know the specific user id, maybe pass it?
  // in theory userCollection should work too though but is probably slower
  let query = `
    {
      userDetailsCollection(first: 1) {
        edges {
          node {
            aiTasksAvailable
          }
        }
      }
    }
  `

  // get user's aiTasksAvailable
  const res = await fetch(process.env.GRAFBASE_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": context.request.headers["x-api-key"],
    },
    body: JSON.stringify({
      query,
    }),
  })
  if (!res.ok) {
    // not sure if I should throw here or return an error
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  const tasksAvailable = (await res.json()).data.userCollection.edges[0].node
    .aiTasksAvailable

  if (tasksAvailable > 0) {
    // decrement aiTasksAvailable by 1
    // query = ``

    const suggestions = await fetch(
      `${process.env.AI_ENDPOINT}/subtasks?request=${task}`,
      {
        headers: {
          OPENAI_KEY: process.env.OPENAI_API_KEY!,
        },
      }
    )

    // update cache
    // await redis.set(cacheString, suggestions.json())
    // console.log(JSON.stringify(suggestions.json()))
    return {
      tasks: suggestions.json(),
    }
  }
  return {}

  // return []

  // return []
  // check if current user `aiTasksAvailable` is greater than 0
  // graphql query?
  let aiTasksAvailable = 1

  if (aiTasksAvailable > 0) {
    // decreate aiTasksAvailable by 1
    // graphql?
    aiTasksAvailable--

    const res = await fetch(
      `${process.env.AI_ENDPOINT}/subtasks?request=${task}`,
      {
        headers: {
          OPENAI_KEY: process.env.OPENAI_API_KEY!,
        },
      }
    )
    return res.json()
  }

  // user can't make the request, return a stripe page
  // change stripe page
  try {
    const data = await stripe.checkout.sessions.create({
      success_url: "https://kuskus.app/success",
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
      },
    })
    return { url: data.url }
  } catch (error) {
    console.log(error)
    return {
      url: "test",
    }
  }
}
