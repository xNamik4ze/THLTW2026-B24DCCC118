import { Card, InputNumber, Typography, Space, Alert, Button } from 'antd';
import { useState, useEffect } from 'react';

const { Text } = Typography;

const Game1 = () => {
    const [targetNumber, setTargetNumber] = useState<number>(0);
    const [inputValue, setInputValue] = useState<number | null>(null);
    const [attemptsLeft, setAttemptsLeft] = useState<number>(10);
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'info' | 'error' }>({
        msg: 'Nhập số từ 1 đến 100',
        type: 'info'
    });

    const initGame = () => {
        const randomNum = Math.floor(Math.random() * 100) + 1;
        setTargetNumber(randomNum);
        setAttemptsLeft(10);
        setIsGameOver(false);
        setInputValue(null);
    };

    useEffect(() => {
        initGame();
    }, []);

    const handleCheck = () => {
        if (inputValue === null || isGameOver) return;

        const currentGuess = inputValue;
        const newAttempts = attemptsLeft - 1;
        setAttemptsLeft(newAttempts);

        if (currentGuess === targetNumber) {
            setFeedback({ msg: `Chúc mừng! Bạn đã đoán đúng số ${targetNumber}!`, type: 'success' });
            setIsGameOver(true);
        } else if (currentGuess < targetNumber) {
            setFeedback({ msg: `Bạn đoán quá thấp!`, type: 'error' });
        } else {
            setFeedback({ msg: `Bạn đoán quá cao!`, type: 'error' });
        }

        if (newAttempts === 0 && currentGuess !== targetNumber) {
            setFeedback({ msg: `Bạn đã hết lượt. Số đúng là ${targetNumber}.`, type: 'error' });
            setIsGameOver(true);
        }
        
        setInputValue(null);
    };

    return (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <Card 
                title="BÀI 1: TRÒ CHƠI ĐOÁN SỐ" 
                style={{ width: 400, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    
                    <Alert 
                        message={feedback.msg} 
                        type={feedback.type} 
                        showIcon 
                        style={{ fontWeight: 'bold' }}
                    />

                    <div>
                        <Text strong style={{ fontSize: '16px' }}>Lượt còn lại: {attemptsLeft}</Text>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <InputNumber
                            min={1}
                            max={100}
                            style={{ flex: 1 }}
                            value={inputValue}
                            onChange={(val) => setInputValue(val)}
                            placeholder="Nhập số..."
                            disabled={isGameOver}
                            onPressEnter={handleCheck}
                        />
                        <Button 
                            type="primary" 
                            onClick={handleCheck} 
                            disabled={isGameOver || inputValue === null}
                        >
                            Đoán
                        </Button>
                    </div>

                </Space>
            </Card>
        </div>
    );
};

export default Game1;