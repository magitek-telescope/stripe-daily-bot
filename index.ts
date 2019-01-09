import Stripe from 'stripe'
import dayjs from 'dayjs'
import axios from 'axios'
const env = process.env as any
const stripe = new Stripe(env.STRIPE_TOKEN)
const today = dayjs().startOf('day')
const yesterday = today.add(-1, 'day')

stripe.charges.list(
  {
    created: {
      gt: `${yesterday.unix()}`,
      lt: `${today.unix()}`
    }
  },
  async (err, charges) => {
    if (err) {
      console.error('Error')
    }
    try {
      axios.post(env.SLACK_ENDPOINT, {
        attachments: [
          {
            color: '#6096F1',
            title: `${yesterday.format('YYYY/MM/DD')}の売上`,
            title_link: 'https://dashboard.stripe.com/balance/overview',
            fields: [
              {
                title: '決済件数',
                value: `${charges.data.length}件`,
                short: true
              },
              {
                title: '当日総売上',
                value: `${charges.data
                  .map(d => d.amount)
                  .reduce((b, a) => b + a, 0)}円`,
                short: true
              }
            ],
            footer: 'Stripe Bot',
            footer_icon: 'https://stripe.com/img/v3/home/twitter.png'
          }
        ]
      })
      console.log('success')
    } catch (e) {
      console.error('error')
    }
  }
)
