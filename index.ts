import Stripe from 'stripe'
import dayjs from 'dayjs'
import axios from 'axios'
const env = process.env as any
const stripe = new Stripe(env.STRIPE_TOKEN)

// Note: payouts じゃなくて charges の一覧がほしい
stripe.payouts.list(
  {
    arrival_date: {
      gt: `${dayjs()
        .add(-14, 'day')
        .startOf('day')
        .unix()}`,
      lt: `${dayjs()
        .startOf('day')
        .unix()}`
    }
  },
  (err, payouts) => {
    if (err) {
      console.error('Error')
    }
    console.log(payouts.data)
    axios.post(env.SLACK_ENDPOINT, {
      attachments: [
        {
          color: '#6096F1',
          title: `${dayjs()
            .add(-1, 'day')
            .format('YYYY/MM/DD')}の売上`,
          title_link: 'https://dashboard.stripe.com/balance/overview',
          fields: [
            {
              title: '決済件数',
              value: `${payouts.data.length}件`,
              short: true
            },
            {
              title: '当日総売上',
              value: `${payouts.data
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
  }
)
