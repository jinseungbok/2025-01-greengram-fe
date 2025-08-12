<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useAuthenticationStore } from '@/stores/authentication';
import FeedCard from '@/components/FeedCard.vue';
import { getFeedList, postFeed } from '@/services/feedService';

const INFINITY_SCROLL_GAP = 500;

const modalCloseButton = ref(null);

const authenticationStore = useAuthenticationStore();

const state = reactive({
    list: [],
    isLoading: false,
    isFinish: false,
    feed: {
        location: '',
        contents: '',
        pics: []
    }
});

const data = {
    page: 1,
    rowPerPage: 20,    
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    getData();
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

const getCurrentTimestamp = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);

    const hours = ('0' + today.getHours()).slice(-2); 
    const minutes = ('0' + today.getMinutes()).slice(-2);
    const seconds = ('0' + today.getSeconds()).slice(-2); 

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const getData = async () => {
    state.isLoading = true;
    const params = {
        page: data.page++,
        row_per_page: data.rowPerPage
    }
    const res = await getFeedList(params);
    if(res.status === 200) {
        const result = res.data.result;
        if(result && result.length > 0) {
            state.list = [...state.list, ...result];            
        }
        if(result.length < data.rowPerPage) {
            state.isFinish = true
        }        
    }
    state.isLoading = false;
}

const handlePicChanged = e => {
  state.feed.pics = e.target.files;
}

const saveFeed = async () => {
    console.log('state.feed.pics: ', state.feed.pics);
    const MAX_PIC_COUNT = 10;
    //사진 있는지 확인    
    if(state.feed.pics.length === 0) { 
        alert('사진을 선택해 주세요.');
        return;
    } else if(state.feed.pics.length > MAX_PIC_COUNT) {
        alert(`사진은 #{MAX_PIC_COUNT}장까지 선택 가능합니다.`);
        return;
    }

    const params = {
        contents: state.feed.contentslength === 0 ? null : state.feed.contents,
        location: state.feed.location.length === 0 ? null : state.feed.location
    } // null은 counting 되지 않음. oracle에서는 null이 치명적

    const formData = new FormData();
    formData.append('req', new Blob([JSON.stringify(params)], { type: 'application/json' }));
    for(let i=0; i<state.feed.pics.length; i++) {
        formData.append('pic', state.feed.pics[i])
    }

    // formData.append('pic', state.feed.pics[0])
    // formData.append('pic', state.feed.pics[0])
    // formData.append('pic', state.feed.pics[0])

    const res = await postFeed(formData);
    if(res.status === 200) {
        const result = res.data.result;

        const item = {
            ...params,
            feedId: result.feedId,
            pics: result.pics,
            writerId: authenticationStore.state.signedUser.userId,
            writerNm: authenticationStore.state.signedUser.nickName,
            writerPic: authenticationStore.state.signedUser.pic,
            createdAt: getCurrentTimestamp(),
            comment: {
                moreComment: false,
                commentList: []
            }  
        };

        state.list.unshift(item);

        modalCloseButton.value.click(); //모달창 닫기
    }
}

const initInputs = () => {
    state.feed.contents = '';
    state.feed.location = '';
    state.feed.pics = [];
}

const handleScroll = () => {
    console.log('스크롤 이벤트');
    if(state.isFinish || state.isLoading || parseInt(window.innerHeight + window.scrollY) + INFINITY_SCROLL_GAP <= document.documentElement.offsetHeight) {
        return;
    }        
    getData();  
};
</script>

<template>
    <section class="back_color">
        <div class="container d-flex flex-column align-items-center">
            <feed-card v-for="item in state.list" :key="item.id" :item="item"></feed-card>
            <p v-if="state.isLoading">
                Loading...
            </p>
        </div>
    </section>
    <div class="modal fade" id="newFeedModal" tabIndex="-1" aria-labelledby="newFeedModalLabel" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-xl">
            <div class="modal-content" id="newFeedModalContent">
                <div class="modal-header">
                    <h5 class="modal-title" id="newFeedModalLabel">새 게시물 만들기</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" ref="modalCloseButton"></button>
                </div>
                <div class="modal-body" id="id-modal-body">                            
                    <div>location: <input type="text" name="location" placeholder="위치" v-model="state.feed.location"/></div>
                    <div>contents: <textarea name="contents" placeholder="내용" v-model="state.feed.contents"></textarea></div>
                    <div><label>pic: <input name="pics" type="file" multiple accept="image/*" @change="handlePicChanged"/></label></div>
                    <div><button @click="saveFeed">전송</button></div>
                    <!-- form tag를 주고 required 하는 방법 있음(이미지가 꼭 필요한 경우) -->
                    <!-- form tag 감싸고 input tag로 해주는 것은 괜찮음 -->
                </div>
            </div>
        </div>                
    </div> 
</template>

<style scoped>
.back_color { background-color: #fafafa; }
</style>