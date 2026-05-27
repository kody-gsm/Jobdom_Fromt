'use client';
import { Input, Button, Option } from "../components/atoms";
import { InputField } from "../components/molecules";
import { Header, HeaderTwo } from "../components/organisms";

export default function Test() {
    return (
        <div>
            <Header />
            <HeaderTwo />
            <Input 
                placeholder="테스트 입력창"
            />
            <InputField 
                placeholder="테스트 입력창"
                title="제목"
                skin="outlined"
            />
            <InputField 
                placeholder="테스트 입력창"
                title="제목"
                skin="filled"
                p="비밀번호 변경"
            />
            <InputField 
                placeholder="테스트 입력창"
                title="제목"
                skin="filled"
                errormsg="* 잘못된 비밀번호입니다."
                p="비밀번호 변경"
            />
            <Button
                className="font-bold text-xl"
                content="테스트 버튼"
            />
            <Button
                className="font-medium text-xl"
                content="취소"
                skin="cancel"
            />
            <Button
                className="font-medium text-xl"
                content="확인"
            />
            <Option
                content="월"
                skin="day"
                p="11"
            />
            <Option
                content="화"
                skin="day"
                p="12"
                checked={true}
            />
            <Option
                content="1교시"
                skin="period"
            />
            <Option
                content="2교시"
                skin="period"
                checked={true}
            />
        </div>
    );
}