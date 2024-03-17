<template>
  <q-layout view="lHr lpR fFf">
    <q-header height-hint="98"> </q-header>
    <q-page-container>
      <q-page padding class="column items-center">
        <q-form class="column" @submit="onCreateItem" :style="layoutWidth">
          <div class="row">
            <q-input
              color="accent"
              ref="refTitle"
              class="col-12"
              autocomplete="off"
              outlined
              dense
              v-model="title"
              label="Title"
              :rules="[
                (val) => (val && val.length > 0) || 'Title is required.',
                (val) =>
                  (val && val.length <= 200) ||
                  'Title is limited to 200 characters.',
              ]"
            >
            </q-input>
          </div>
          <div class="row">
            <q-input
              color="accent"
              class="col-12"
              rows="2"
              type="textarea"
              autocomplete="off"
              outlined
              dense
              v-model="description"
              label="Description"
              :rules="[
                (val) =>
                  val.length <= 2000 ||
                  'Descripton is limited to 2000 characters.',
              ]"
            >
            </q-input>
          </div>
          <div class="row justify-between">
            <q-input
              color="accent"
              class="col-9 q-mr-sm"
              dense
              outlined
              v-model="dueDate"
              label="Due Date"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="dueDate" mask="YYYY-MM-DD" today-btn>
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-btn class="col" outline label="Create" color="accent" type="submit" style="height: 40px" />
          </div>
        </q-form>
        <q-separator
          color="accent"
          class="row q-mt-md q-mb-md"
          :style="layoutWidth"
        />
        <div :style="layoutWidth" class="row justify-end">
          <q-checkbox color="accent" :model-value="isShowDone" @update:model-value="toogleShowDone()" label="Show completed"/>
        </div>
        <div v-for="item in filteredItems" :key="item.id" class="caption row">
          <q-card class="my-card q-mb-sm" flat bordered  :style="layoutWidth">
            <q-card-section class="q-pa-none">
              <q-card-section class="q-pa-sm row justify-between">
                <div class="title col-10 col-lg-10 col-xl-10" style="overflow-wrap: anywhere;">
                  <q-checkbox color="accent" :true-value="1" :false-value="0" :model-value="item.isDone" @update:model-value="done(item)"/>
                  <span :class="item.isDone == 1 ? 'text-strike' : ''">{{ item.title }}</span>
                </div>
                <div class="actions col-2 col-lg-2 col-xl-2 row justify-end items-center">
                  <q-icon size="sm" color="accent" name="o_info" @click="showDetail(item)">
                    <q-tooltip class="bg-accent"  style="font-size: small">
                      <div>
                        Created On: {{ convertUTCDateToLocalDate(item.createdDate) }}
                      </div>
                      <div>
                        Due Date: {{ item.dueDate ? item.dueDate : "none"}}
                      </div>
                      <div>
                        Description:
                      </div>
                      <div style="white-space: pre-wrap;">{{item.description}}</div>
                    </q-tooltip>
                  </q-icon>
                  <q-icon v-if="item.isDone !== 1 && isDueDate(item.dueDate)" class="q-ml-xs" size="sm" color="red" name="o_query_builder">
                    <q-tooltip class="bg-accent"  style="font-size: small">
                      Over due: {{ overDueDate(item.dueDate) }} day(s)
                    </q-tooltip>
                  </q-icon>
                </div>
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <q-footer class="row justify-center bg-accent" style="height: 40px;">
      <span  class="self-center text-subtitle1">Built on top of <a href="#" @click="showTechStack()">Bun and Vue</a></span>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, Ref, computed } from 'vue';
import { CreateItemRequest } from '../models/CreateItemRequest';
import { UpdateStatusRequest } from '../models/UpdateStatusRequest';
import { date, QInput, useQuasar } from 'quasar';
import { Item } from '../models/Item';
import DetailDialog from './DetailDialog.vue'
import TechStackDialog from './TechStackDialog.vue'
import { convertUTCDateToLocalDate } from '../utils/utils';

const $q = useQuasar();
const title = ref('');
const isShowDone = ref(true)
const description = ref('');
const dueDate = ref('');
const items: Ref<Item[]> = ref([]);
const filteredItems: Ref<Item[]> = computed(() => {
  if (isShowDone.value === false) {
    return items.value.filter(i => i.isDone == 0)
  }
  return items.value
})
const refTitle = ref<QInput | null>(null);
const layoutWidth = computed(() => {
  switch ($q.screen.name) {
    case 'xs':
      return 'width: 360px;';
    default:
      return 'width: 500px;'
  }
})
onBeforeMount(async () => {
  items.value = await fetch(`${process.env.API_SERVER}/items`)
    .then((res) =>
      res.json()
    )
    .catch((error) => {
      $q.notify({
          type: 'negative',
          message: `${error}.`,
        })
    });
});
var socket = new WebSocket(`${process.env.WEBSOCKET_SERVER}/ws`);
// message is received
socket.addEventListener('message', (event) => {
  const receivedData = JSON.parse(event.data)
  if (receivedData.type === 'update') {
    const index = items.value.findIndex((item) => item.id === receivedData.id);
    if (index !== -1) {
      items.value[index].isDone = receivedData.isDone;
      if (receivedData.isDone === 1) {
        $q.notify({
          type: 'positive',
          message: `Someone has done an item: ${items.value[index].title}.`,
        })
      } else if (receivedData.isDone === 0){
        $q.notify({
          type: 'positive',
          message: `Someone has undone an item: ${items.value[index].title}.`,
        })
      }
    }
  } else if (receivedData.type === 'create') {
    const itemTemp = JSON.parse(event.data) as Item;
    items.value.unshift(itemTemp);
    $q.notify({
      type: 'positive',
      message: `Someone has created an item: ${itemTemp.title}.`,
    });
  }
});

// socket opened
socket.addEventListener('open', (event) => {
  console.log('open', event);
});

// socket closed
socket.addEventListener('close', (event) => {
  console.log('close', event);
});

// error handler
socket.addEventListener('error', (event) => {
  console.log('error', event);
});
async function onCreateItem() {
  const createItemRequest: CreateItemRequest = {
    title: title.value,
    description: description.value,
    dueDate: dueDate.value,
  };
  refTitle.value?.focus()
  title.value = ''
  description.value = ''
  dueDate.value = ''
  setTimeout(() => refTitle.value?.resetValidation(), 100);

  const response = await fetch(`${process.env.API_SERVER}/items`, {
    method: 'POST',
    body: JSON.stringify(createItemRequest),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  items.value.unshift(data[0]);

  const createItem = {
    type: 'create',
    ...data[0]
  }
  socket.send(JSON.stringify(createItem));
}
async function done(item: Item) {
  const updateStatusRequest: UpdateStatusRequest = {
    id: item.id,
    isDone: item.isDone === 0 ? 1 : 0
  }
  const response: Response = await fetch(`${process.env.API_SERVER}/items/done`, {
    method: 'POST',
    body: JSON.stringify(updateStatusRequest),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    const index = items.value.findIndex(x => x.id === item.id);
    items.value[index].isDone = updateStatusRequest.isDone
    const data = await response.json();
    const updateItem = {
      type: 'update',
      ...data[0],
    }
    socket.send(JSON.stringify(updateItem));
  }
}
function isDueDate(dueDate: Date): boolean {
  if (dueDate === null) {
    return false
  }
  const today = new Date()
  const dateDiff = date.getDateDiff(dueDate, today, 'days')
  if (dateDiff < 0) {
    return true
  }
  return false
}
function overDueDate(dueDate: Date): number {
  const today = new Date()
  const dateDiff = date.getDateDiff(today, dueDate, 'days')
  return dateDiff
}
function showDetail(item: Item) {
  $q.dialog({
    component: DetailDialog,
    componentProps: {
      item: item,
    },
  })
    .onOk(() => {
      // TODO
    })
    .onCancel(async () => {
      // TODO
    })
    .onDismiss(() => {
      // TODO
    });
}
function showTechStack() {
  $q.dialog({
    component: TechStackDialog,
  })
    .onOk(() => {
      // TODO
    })
    .onCancel(async () => {
      // TODO
    })
    .onDismiss(() => {
      // TODO
    });
}
async function toogleShowDone() {
  isShowDone.value = !isShowDone.value
}
</script>
<style scoped>
a:link {
  color: white;
  background-color: transparent;
}

a:visited {
  color: white;
  background-color: transparent;
}

a:hover {
  color: plum;
  background-color: transparent;
  text-decoration: underline;
}

a:active {
  color: white;
  background-color: transparent;
  text-decoration: underline;
}
</style>
../utils../utils/utils.ts
