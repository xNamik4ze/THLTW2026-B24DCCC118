import { Card, Typography, Space, Alert, Button, List, Tag } from 'antd'
import { useState } from 'react'

const { Text } = Typography

const list = [
  { id: 'bua', label: 'Búa' },
  { id: 'keo', label: 'Kéo' },
  { id: 'bao', label: 'Bao' }
]

const Game1 = () => {
  const [history, setHistory] = useState<any[]>([])
  const [msg, setMsg] = useState({
    msg: 'Búa, Kéo, Bao!',
    type: 'info'
  })

  const play = (id: string) => {
    const rd = Math.floor(Math.random() * 3)
    const cpu = list[rd]
    let player = list.find(item => item.id === id)

    if (!player) return

    let kq = ''
    if (player.id === cpu.id) {
      kq = 'Hòa'
    } else if (
      (player.id === 'bua' && cpu.id === 'keo') ||
      (player.id === 'keo' && cpu.id === 'bao') ||
      (player.id === 'bao' && cpu.id === 'bua')
    ) {
      kq = 'Thắng'
    } else {
      kq = 'Thua'
    }

    let t: any = 'warning'
    if (kq === 'Thắng') t = 'success'
    else if (kq === 'Thua') t = 'error'

    setMsg({
      msg: `Bạn chọn ${player.label}, Máy chọn ${cpu.label}. Bạn ${kq}!`,
      type: t
    })

    const item = {
      user: player.label,
      computer: cpu.label,
      result: kq
    }

    setHistory([item, ...history])
  }

  return (
    <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
      <Card
        title="BÀI 1: TRÒ CHƠI OẲN TÙ TÌ"
        style={{ width: 450, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert message={msg.msg} type={msg.type as any} showIcon style={{ fontWeight: 'bold' }} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {list.map((x) => (
              <Button
                key={x.id}
                size="large"
                type="primary"
                ghost
                onClick={() => play(x.id)}
                style={{ height: 60, width: 100, fontSize: 18 }}
              >
                {x.label}
              </Button>
            ))}
          </div>

          <div style={{ textAlign: 'left' }}>
            <Text strong>Lịch sử ván đấu:</Text>
            <List
              size="small"
              bordered
              dataSource={history}
              style={{ marginTop: 10, maxHeight: 180, overflowY: 'auto' }}
              renderItem={(it, i) => {
                let color = 'orange'
                if (it.result === 'Thắng') color = 'green'
                else if (it.result === 'Thua') color = 'red'

                const round = history.length - i

                return (
                  <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>
                      Ván {round}: {it.user} vs {it.computer}
                    </Text>
                    <Tag color={color}>{it.result}</Tag>
                  </List.Item>
                )
              }}
            />
          </div>
        </Space> 
      </Card>
    </div>
  )
}

export default Game1;